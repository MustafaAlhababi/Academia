# Copyright (c) 2024, SanU and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class FacultyMemberAcademicRanking(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		academic_rank: DF.Link
		attachment: DF.Attach | None
		country: DF.Link | None
		general_field: DF.Data | None
		granting_authority: DF.Link | None
		name: DF.Int | None
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		specialist_field: DF.Data | None
		thesis_title: DF.Data | None
	# end: auto-generated types
	pass
