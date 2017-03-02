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


function Submitter(form, data, opt_fetcher) {
  this.form = form;
  this.data = data;
  this.fetcher = opt_fetcher || window;
}

Submitter.prototype.submit = function() {
  // returns a promise?
  var formData = new FormData();

  new InputWalker(this.form).forEach((input, prop) => {
    // Populates all of the fields wiht the data points.

    input["@name"] = input["@name"] || prop;
    var name = input["@name"];

    if (this.data[name]) {
      // TODO(goto): make sure that the value matches the input type
      // as well as the type constrains (e.g. min, max, etc).
      input["@value"] = this.data[name];
    }
  }).forEach(input => {
    // Checks if all of the required fields are present.
    if (input["@required"] && !input["@value"]) {
      throw new Error("required field isn't set: " + input["@name"]);
    }
  }).forEach(input => {
    // console.log(input);
    formData.append(input["@name"], input["@value"]);
    // console.log(formData);
  });

  return this.fetcher
      .fetch(this.form["@action"], {
	method: this.form["@method"] || "GET",
	body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not OK: " + response);
        }
	  return response.json();
        })
      .then(result => $(result));
}

function InputWalker(form) {
  this.form = form;
}

InputWalker.prototype.forEach = function(callback) {
  for (var prop in this.form) {
    if (prop[0] == "@") {
      continue;
    }

    callback(this.form[prop], prop);
  }
  return this;
}
