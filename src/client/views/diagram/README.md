Diagramming Tool

How to Manage the Diagram

Short Answer

Assign the data to the diagram scope in "scripts/controllers/diagram.js" and get it from here anytime you want ("$scope.data"). The directive watching the data and if it changes - redraws the diagram.
Data represent a trivial array:

[
	{
		id: "1",
		style: "1",
		type: "2",
		text: "Lorem ipsum",
		to: {1: "1"},
		width: "auto",
		x: "10%",
		y: "10%"
	}
, 
	{
		...
	}
]


Long Answer

The tool has four parts:

1. scripts/controllers/diagram.js
The controller. Manages data and generates text representation of diagram for further converting into PNG (button "Show source").

2. scripts/directives/diagram.js
Diagram directive. Monitors the data and draws the diagram.

3. scripts/services/diagram.js
Some more or less complex functions that used in main directive, such as generators of shapes, multiline-text generators etc.

4. views/diagram/main.html
Angular template. Contain also modal window template for adding and editing blocks.

Data Management

The data stored inside of diagram controller as array of this kind:
[
	{
		id: "1", <!-- Unique id, can be integer or a string -->
		style: "1", <!-- Determines the fill of block, border width etc. -->
		type: "2",  <!-- Determines the shape of block -->
		text: "Lorem ipsum",  <!-- The text inside of block -->
		to: {1: "1"}, <!-- The links where the key is "id" of linked block and value is a type of line (solid or dashed) -->
		width: "auto", <!-- Width of block. Can be "auto" or absolute number. -->
		x: "10%", y: "10%" <!-- The "x" and "y" coordinates of top left corner of block. Can be relative as percent or absolute number. -->
	}
, 
	{
		...
	}
]

To update the diagram is enough to assign the new data to the scope "scripts/controllers/diagram.js", like this:
<!-- ... -->
$scope.data = [{id: "1", style: "1", type: "2", text: "Lorem ipsum", to: {1: "1"}, width: "auto", x: "10%", y: "10%"}];
<!-- ... -->
after that the diagram will be redrawn automatically. The scope always contain actual data ($scope.data) so you can serialize it as JSON and send to the server anytime.