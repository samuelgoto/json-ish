function $(node, opt_parent) {
  for (var prop in node) {

    // Recursively look into all of the nodes
    if (typeof node[prop] == "object") {
      // console.log();
      node[prop] = $(node[prop], prop);
    }

    // If we are dealing with reserved keyword
    switch (prop) {
      case "@a": {
	var link = node["@a"];
	// console.log("anchor tag");
	var result = function() {
	  // TODO(goto): deal with relative URLs.
	  return fetch(link["@href"], {
	    headers: new Headers({
	      "Accept": "application/json"
	    })
          })
	      .then(response => response.json())
	      .then(data => $(data));
	};
	result.toString = function() {
	  return `
A link to <${link["@href"]}>.
Call ${opt_parent}() to dereference it.
`;
	}
	return result;
	break;
      }
      case "@form": {
	var form = node["@form"];
	var result = function() {
	  console.log(arguments);
	  console.log("form");
	  console.log(form);
	  console.log(form["@action"]);
	  console.log(form["@method"]);
	  for (var input in form) {
	  }
	}
	result.toString = function() {
	  var description = "";
	  description += "Form: " + opt_parent + "\n";
	  description += "Action: " + form["@action"] + "\n";
	  description += "Method: " + form["@method"] + "\n";
	  description += "Input:\n";
	  for (var input in form) {
	    if (input[0] != '@' &&
		form[input]["@input"]) {
	      var required = form[input]["@input"]["@required"];
	      var type = form[input]["@input"]["@type"];
	      description += " - ";
	      description += input;
	      description += ": " + (type ? type : "text") + " ";
	      description += required ? " (required)" : "";
	      description += "\n";
	    }
	  }
	  return description;
	}
	return result;
	break;
      }
    }
  }
  return node;
}
