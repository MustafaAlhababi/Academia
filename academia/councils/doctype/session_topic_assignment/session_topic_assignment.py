# Copyright (c) 2024, SanU and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class SessionTopicAssignment(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		decision: DF.TextEditor | None
		decision_type: DF.Literal["", "Postponed", "Resolved", "Transferred"]
		description: DF.TextEditor | None
		forward_assignment: DF.Link | None
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		title: DF.Data | None
		topic_assignment: DF.Link
	# end: auto-generated types
	pass
