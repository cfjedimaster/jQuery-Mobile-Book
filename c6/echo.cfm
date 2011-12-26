<div data-role="page">

	<div data-role="header">
		<h1>Form Result</h1>
	</div>
	
	
	<div data-role="content">
		<cfloop item="field" collection="#form#">
			<cfoutput>
				<p>
				The form field #field# has the value #form[field]#.
				</p>
			</cfoutput>
		</cfloop>
	</div>
	
</div>