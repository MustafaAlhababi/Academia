// Copyright (c) 2024, SanU and contributors
// For license information, please see license.txt

frappe.ui.form.on("Session", {
	setup: function (frm) {
		// Changing Button Style
		$(`<style>
      .btn[data-fieldname="get_members"] {
        background-color: #171717; /* Custom dark gray */
        color: white;
      }
      .btn[data-fieldname="get_members"]:hover {
        background-color: #171710 !important;/* Slightly darker gray for interaction states */
        color: white !important;
      }
      .btn[data-fieldname="get_topics"] {
        background-color: #171717; /* Custom dark gray */
        color: white;
      }
      .btn[data-fieldname="get_topics"]:hover {
        background-color: #171710 !important;/* Slightly darker gray for interaction states */
        color: white !important;
      }
        </style>`).appendTo("head");
	},
	onload(frm) {
		frm.set_query("topic", "topics", function () {
			return {
				filters: {
					docstatus: ["=", 0],
					council: frm.doc.council,
					status: "Accepted",
					parent_topic: "",
				},
			};
		});
	},

	validate(frm) {
		frm.events.validate_time(frm);
		academia.councils.utils.validate_head_exist(frm.doc.members);
	},
	/**
	 * Fetches the members of the selected council and adds them to the session form.
	 * @param {object} frm - The current form object.
	 */
	fetch_members_from_council(frm) {
		// Retrieve council form for selected council
		frappe.db.get_doc("Council", frm.doc.council).then((council) => {
			if (council.members) {
				// Clear any existing members in the child table:
				frm.doc.members = "";
				// Loop through the council members and add them to the child table:
				council.members.forEach((council_member) => {
					frm.add_child("members", {
						employee: council_member.employee,
						member_name: council_member.member_name,
						attendance: "Attend",
						member_role: council_member.member_role,
					});
				});
				// Refresh the child table to display the new member:
				frm.refresh_field("members");
			}
		});
	},
	council(frm) {
		// Event handler for 'council' field change
		if (frm.doc.council) {
			// Fetch members from the selected council
			frm.trigger("fetch_members_from_council");
		}
	},
	validate_time(frm) {
		if (frm.doc.begin_time && frm.doc.end_time) {
			if (frm.doc.begin_time > frm.doc.end_time) {
				frappe.throw(__("End time must be after begin time"));
			}
		}
	},
	get_members: function (frm) {
		new frappe.ui.form.MultiSelectDialog({
			doctype: "Employee",
			target: frm,
			setters: {
				employee_name: null,
				company: frappe.defaults.get_default("company"),
				department: null,
				designation: null,
			},
			// add_filters_group: 1,
			get_query() {
				return {
					filters: { docstatus: ["!=", 2], company: this.setters.company },
				};
			},
			primary_action_label: "Get Members",
			action(selections) {
				// console.log(d.dialog.get_value("company"));
				// emptying Council members
				frm.set_value("members", []);
				// Hold employee names
				selections.forEach((member, index, array) => {
					frappe.db.get_value("Employee", member, "employee_name", (employee) => {
						if (employee) {
							frm.add_child("members", {
								employee: member,
								member_name: employee.employee_name,
								member_role: "Council Member",
							});
							// Refreshing the Council Members in the last itration
							console.log(`array => ${array}`);
							if (index === array.length - 1) {
								frm.refresh_field("members");
							}
						}
					});
				});
				this.dialog.hide();
			},
		});
	},
	get_topics(frm) {
		new frappe.ui.form.MultiSelectDialog({
			doctype: "Topic",
			target: frm,
			setters: {
				title: null,
				category: null,
			},
			// add_filters_group: 1,
			get_query() {
				return {
					filters: {
						docstatus: ["=", 0],
						council: frm.doc.council,
						status: "Accepted",
						parent_topic: "",
					},
				};
			},
			primary_action_label: "Get Topic",
			action(topics) {
				// Clear any existing topics in the child table:
				frm.doc.topics = "";
				// Loop through the topics and add them to the child table:
				topics.forEach((topic) => {
					console.log(topic);
					frappe.db.get_value(
						"Topic",
						topic,
						["name", "title", "description"],
						(topic_doc) => {
							frm.add_child("topics", {
								topic: topic_doc.name,
								title: topic_doc.title,
								description: topic_doc.description,
							});
							frm.refresh_field("topics");
						}
					);
				});
				// Refresh the child table to display topics:
				frm.refresh_field("topics");
				this.dialog.hide();
			},
		});
	},
});
frappe.ui.form.on("Session Topic", {
	topic: function (frm, cdt, cdn) {
		// Get the current row
		let row = locals[cdt][cdn];
		validate_topic(frm, row);
		if (row.topic) {
			// Call the check_topic_duplicate function to check for duplicate topics
			check_topic_duplicate(frm, row);
			frappe.db.get_value("Topic", row.topic, ["title", "description"], (topic) => {
				if (topic) {
					let title = topic.title;
					let description = topic.description;
					frappe.model.set_value(cdt, cdn, "title", title);
					frappe.model.set_value(cdt, cdn, "description", description);
				}
			});
			frm.refresh_field("topics");
		}
	},
	// create_memo(frm, cdt, cdn) {
	//     let row = locals[cdt][cdn];
	//     let dialog = new frappe.ui.Dialog({
	//         title: __("New Council Memo"),
	//         fields: [
	//             {
	//                 label: __("Council"),
	//                 fieldtype: "Link",
	//                 options: "Council",
	//                 fieldname: "council",
	//                 reqd: 1,
	//             },
	//             {
	//                 "fieldname": "title",
	//                 "fieldtype": "Data",
	//                 "label": "Title"
	//             },
	//             {

	//                 "fieldname": "description",
	//                 "fieldtype": "Text Editor",
	//                 "label": "Description"
	//             },

	//         ],
	//         primary_action_label: __("Save"),
	//         primary_action: (values) => {
	//             values.doctype = "Council Memo";
	//             values.originating_assignment = row.topic_assignment;
	//             frappe.db.insert(values).then((doc) => {
	//                 frappe.model.set_value(cdt, cdn, 'council_memo', doc.name);
	//                 dialog.hide();
	//             });
	//         },
	//     });

	//     dialog.show();
	// }
	// ,
});
frappe.ui.form.on("Session Member", {
	employee: function (frm, cdt, cdn) {
		// Get the current row
		let row = locals[cdt][cdn];
		frappe.db.get_value("Employee", row.employee, "employee_name", (employee) => {
			if (employee) {
				let member_name = employee.employee_name;
				frappe.model.set_value(cdt, cdn, "member_name", member_name);
				academia.councils.utils.check_member_duplicate(frm, row);
			}
		});

		frm.refresh_field("members");
	},
	member_role: function (frm, cdt, cdn) {
		// Get the current row
		let row = locals[cdt][cdn];
		// Call the check_council_head_and_reporter_duplication function to check for duplicate members Council Heads and Reporters
		academia.councils.utils.check_council_head_and_reporter_duplication(frm, row);
	},
});
// Function to check for duplicate topics
check_topic_duplicate = function (frm, row) {
	// Iterate through each member in the form's topics field
	frm.doc.topics.forEach((topic_doc) => {
		// Check if the current row's topic is not empty or the same as the current topic being iterated
		if (!(row.topic == "" || row.idx == topic_doc.idx)) {
			// Check if the current row's topic is the same as the topic_doc's topic
			if (row.topic == topic_doc.topic) {
				// Clear the topic value in the current row
				row.topic = "";
				// Refresh the topics field in the form to reflect the changes
				frm.refresh_field("topics");
				// message indicating that the topic already exists in a specific row
				msgprint(__(`${row.topic} already exists in row ${topic_doc.idx}`));
				// stop loop
				return;
			}
		}
	});
};
validate_topic = function (frm, row) {
	if (row.topic)
		frappe.db.get_value("Topic", row.topic, ["*"], (topic_doc) => {
			if (
				!(
					topic_doc.docstatus == 0 &&
					topic_doc.council == frm.doc.council &&
					topic_doc.status == "Accepted" &&
					topic_doc.parent_topic == ""
				)
			) {
				// Clear the topic value in the current row
				row.topic = "";
				// Refresh the topics field in the form to reflect the changes
				frm.refresh_field("topics");
				msgprint(__(`You cannot use ${topic_doc.name}, please select from the list`));
			}
		});
};
