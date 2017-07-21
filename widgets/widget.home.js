(function () {
    widget = Retina.Widget.extend({
        about: {
                title: "Sequencing Center Home",
                name: "home",
                author: "Tobias Paczian",
                requires: []
        }
    });
    
    widget.setup = function () {
	return [
	    Retina.load_renderer("table"),
	    Retina.load_widget({ name: "shockbrowse", resource: "Retina/widgets" })
	];
    };
        
    widget.display = function (wparams) {
        var widget = this;
	
	if (wparams && wparams.main) {
	    widget.main = wparams.main;
	}

	if (stm.user) {

	    document.getElementById('login_space').innerHTML = '<button title="click to log out" class="btn btn-inverse" onclick="logout();" style="margin-right: 30px; position: relative; top: 10px;"><i class="icon icon-white icon-user" style="margin-right: 5px;"></i>'+stm.user.name+'</button>';
	    
	    if (stm.user.admin) {
		widget.main.innerHTML = "<p><div class='btn-group' data-toggle='buttons-radio'><button class='btn active' onclick='Retina.WidgetInstances.home[1].showSharedFolders(\"all\");'>show all</button><button class='btn' onclick='widget.getRights().then(function(){Retina.WidgetInstances.home[1].showSharedFolders(\"assigned\")});'>show assigned</button><button class='btn' onclick='widget.getRights().then(function(){Retina.WidgetInstances.home[1].showSharedFolders(\"unassigned\")});'>show unassigned</button></div></p><div id='shock'></div><div style='clear: both; height: 50px;'></div><div id='users'></div>";

		jQuery.ajax({ url: RetinaConfig.shock_url + "/node/?query&distinct=project_id&owner=ANL-SEQ-Core",
			      dataType: "json",
			      success: function(data) {
				  var widget = Retina.WidgetInstances.home[1];
				  var entries = widget.runs = data.data.sort(Retina.sortDesc);				  
				  widget.browser = Retina.Widget.create('shockbrowse', {
				      "target": document.getElementById('shock'),
				      "order": "created_on",
				      "direction": "desc",
				      "allowMultiselect": true,
				      "allowMultiFileUpload": true,
				      "calculateMD5": true,
				      "initialFileDetailRatio": 0.6,
				      "requireLogin": true,
				      "showResizer": false,
				      "middleResize": false,
				      "title": "Sequencing Core Admin Project Browser 1.0",
				      "showToolBar": false,
				      "enableUpload": false,
				      "showDetailBar": false,
				      "width": 1400,
				      "autoSizeAtStartup": true,
				      "detailType": "preview",
				      "customPreview": widget.preview,
				      "customMultiPreview": widget.multiPreview,
				      "activateFolderfilterCallback": null,//widget.projectSelected,
				      "folderFilters": [ { "dropdown": false, "attribute": "project_id", "title": "run", "entries": entries, "filterable": true } ],    
				      "presetFilters": { "owner": "ANL-SEQ-Core", "project_id": entries[0]  },
				      "disableCustomFilter": true,
				      "height": 730,
				      "fileSectionColumns": [
					  { "path": "attributes.project", "name": "Project", "width": "180px", "type": "string", "align": "left", "sortable": true },
					  { "path": "attributes.group", "name": "Group", "width": "180px", "type": "string", "align": "left", "sortable": true },
					  { "path": "file.name", "name": "Name", "width": "remain", "type": "file", "sortable": true },
					  { "path": "file.size", "name": "Size", "width": "100px", "type": "size", "align": "right", "sortable": true }
				      ]
				  });
				  widget.browser.loginAction({ "action": "login", "result": "success", "user": stm.user, "authHeader": stm.authHeader });
			      },
			      error: function(jqXHR, error) {
				  var widget = Retina.WidgetInstances.home[1];
				  console.log(jqXHR.responseText);
			      },
			      crossDomain: true,
			      headers: stm.authHeader
			    });

		jQuery.ajax({ url: RetinaConfig.auth_url + "?action=users",
			      dataType: "json",
			      success: function(data) {
				  var widget = Retina.WidgetInstances.home[1];

				  if (data.ERROR) {
				      document.getElementById('users').innerHTML = '<div class="alert alert-error">could not access user database:<br/><br/>'+data.ERROR+'</div>';
				  } else {
				      widget.users = data.data;
				      widget.usercolumns = data.columns;
				      widget.showUsers();
				  }
			      },
			      error: function(jqXHR, error) {
				  var widget = Retina.WidgetInstances.home[1];

				  document.getElementById('users').innerHTML = '<div class="alert alert-error">could not access user database</div>';
			      },
			      crossDomain: true,
			      headers: stm.authHeader
			    });
	    } else {

		widget.main.innerHTML = "<h3>Data Download Section</h3><p>The data browser below gives you access to all of your files.<ul><li>select a project on the left</li><li>click a file for details</li><li>use shift to select multiple files</li><li>click the download button to download</li></ul></p><div id='shock'></div>";
		
		widget.getRights().then( function () {
		    var widget = Retina.WidgetInstances.home[1];
		    
		    if (stm.DataStore.hasOwnProperty('rights') && stm.DataStore.rights.length) {

			var entries = [];
			for (var i=0; i<stm.DataStore.rights.length; i++) {
			    if (stm.DataStore.rights[i][0] == 'project') {
				entries.push([stm.DataStore.rights[i][1].split(/\|/)[1],stm.DataStore.rights[i][1].split(/\|/)[1]+'&project_id='+stm.DataStore.rights[i][1].split(/\|/)[0]]);
			    }
			}
			
			widget.browser = Retina.Widget.create('shockbrowse', {
			    "target": document.getElementById('shock'),
			    "order": "created_on",
			    "direction": "desc",
			    "allowMultiselect": true,
			    "allowMultiFileUpload": true,
			    "calculateMD5": true,
			    "initialFileDetailRatio": 0.6,
			    "showResizer": false,
			    "middleResize": false,
			    "title": "Sequencing Core File Browser 1.0",
			    "showToolBar": false,
			    "enableUpload": false,
			    "showDetailBar": false,
			    "requireLogin": true,
			    "width": 1400,
			    "folderFilters": [ { "dropdown": false, "attribute": "project", "title": "project", "entries": entries, "filterable": true } ],
			    "detailType": "preview",
			    "customPreview": widget.preview,
			    "customMultiPreview": widget.multiPreview,
			    "presetFilters": { "type": "run-folder-archive-fastq", "project": entries[0][1] },
			    "disableCustomFilter": true,
			    "autoSizeAtStartup": true,
			    "height": 730,
			    "fileSectionColumns": [
				{ "path": "attributes.project", "name": "Project", "width": "180px", "type": "string", "align": "left", "sortable": true },
				{ "path": "attributes.group", "name": "Group", "width": "180px", "type": "string", "align": "left", "sortable": true },
				{ "path": "file.name", "name": "Name", "width": "remain", "type": "file", "sortable": true },
				{ "path": "file.size", "name": "Size", "width": "100px", "type": "size", "align": "right", "sortable": true }
			    ]
			});
			widget.browser.loginAction({ "action": "login", "result": "success", "user": stm.user, "authHeader": stm.authHeader });
		    } else {
			widget.main.innerHTML = '<div class="alert alert-info" style="width: 500px;">You currently do not have access to any data.</div>';
		    }
		});
	    }
	} else {
	    widget.main.innerHTML = "<h3>Authentication required</h3><p>You must be logged in to view this page.</p>";
	}
    };

    widget.share = function () {
	var widget = this;

	var html = [];

	var atts = widget.currentFiles[0].node ? widget.currentFiles[0].node.attributes : widget.currentFiles[0].attributes;

	html.push('<div id="shareDiv" style="display: none; clear: both; padding-top: 20px;">');
	html.push('<h4>What do you want to share?</h4><ul style="list-style-type: none;">');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharewhat" checked value="project" id="shareProject">this project ('+atts.project+')</li>');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharewhat" value="group" id="shareGroup">this group ('+atts.group+')</li>');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharewhat" value="file" id="shareFile">the selected file'+(widget.currentFiles.length > 1 ? "s" : "")+'</li>');
	html.push('</ul>');
	html.push('<h4>How do you want to share?</h4><ul style="list-style-type: none;">');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharehow" checked value="view" id="shareView">the user can only view / download</li>');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharehow" value="shareable">the user can share with others</li>');
	html.push('</ul>');
	html.push('<h4>Who do you want to share with?</h4>');
	html.push('<div class="input-append"><input type="text" placeholder="email address" id="shareEmail"><button class="btn" onclick="Retina.WidgetInstances.home[1].performShare();">share</button></div>');
	html.push('</div>');

	return html.join("");
    };

    widget.shareAdmin = function () {
	var widget = this;

	var html = [];

	var atts = widget.currentFiles[0].node ? widget.currentFiles[0].node.attributes : widget.currentFiles[0].attributes;

	html.push('<div id="shareDiv" style="clear: both; padding-top: 20px;">');
	html.push('<h4>What do you want to assign?</h4><ul style="list-style-type: none;">');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharewhat" checked value="project" id="shareProject">this project ('+atts.project+')</li>');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharewhat" value="group" id="shareGroup">this group ('+atts.group+')</li>');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharewhat" value="file" id="shareFile">the selected file'+(widget.currentFiles.length > 1 ? "s" : "")+'</li>');
	html.push('</ul>');
	html.push('<h4>Who is the customer?</h4>');
	html.push('<div class="input-append"><input type="text" placeholder="email address" id="shareEmail"><button class="btn" onclick="Retina.WidgetInstances.home[1].performShare(true);">share</button></div>');
	html.push('</div>');

	return html.join("");
    };

    widget.performShare = function (assign) {
	var widget = this;

	var dataType = document.getElementById('shareProject').checked ? "project" : (document.getElementById('shareProject').checked ? "group" : "file");
	var shareType = assign ? "admin": (document.getElementById('shareView').checked ? "view" : (document.getElementById('shareOnce').checked ? "once" : "admin"));
	var email = document.getElementById('shareEmail').value;

	if (! email.length) {
	    alert('you must enter an email address');
	    return;
	}

	if (! email.match(/\@/)) {
	    alert('you must enter a valid email address');
	}

	var entries = [];
	if (dataType == 'project') {
	    var node = widget.currentFiles[0].node ? widget.currentFiles[0].node : widget.currentFiles[0];
	    entries.push(node.attributes.project_id+'|'+node.attributes.project);
	} else if (dataType == 'group') {
	    var node = widget.currentFiles[0].node ? widget.currentFiles[0].node : widget.currentFiles[0];
	    entries.push(node.attributes.project_id+'|'+node.attributes.group);
	} else {
	    for (var i=0; i<widget.currentFiles.length; i++) {
		var node = widget.currentFiles[i].node ? widget.currentFiles[i].node : widget.currentFiles[i];
		entries.push(node.attributes.project_id+'|'+node.attributes.name);
	    }
	}

	for (var i=0; i<entries.length; i++) {
	    jQuery.ajax({ url: RetinaConfig.auth_url + "?action=modrights&email="+email+"&type="+dataType+"&item="+entries[i]+"&view=1&edit="+(assign ? "1&add=1" : "0")+"&owner="+(shareType == "admin" ? 1 : 0),
			  dataType: "json",
			  item: dataType=='project' ? entries[i] : (widget.currentFiles[i].node ? widget.currentFiles[i].node.file.name : widget.currentFiles[i].file.name),
			  success: function(data) {
			      var widget = Retina.WidgetInstances.home[1];

			      var tar = document.getElementById('shareResult');
			      if (! tar.innerHTML.length) {
				  tar.innerHTML = "<div class='alert alert-info'></div>";
			      }
			      tar.firstChild.innerHTML += "<div>"+this.item+" shared.</div>";
			  },
			  error: function(jqXHR, error) {
			      var widget = Retina.WidgetInstances.home[1];
			  },
			  crossDomain: true,
			  headers: stm.authHeader
			});
	}
    };

    widget.projectSelected = function (entry) {
	Retina.WidgetInstances.home[1].currentProject = entry;
	jQuery.ajax({ url: RetinaConfig.auth_url + "?action=rights&type=project&item=" + entry,
		      dataType: "json",
		      item: entry,
		      success: function(data) {
			  if (data.ERROR) {
			      var widget = Retina.WidgetInstances.home[1];
			      widget.main.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>An error occurred accessing your permissions:<br>"+data.ERROR+"</div>";
			  } else {
			      var widget = Retina.WidgetInstances.home[1];
			      
			      widget.browser.preserveDetail = true;
			      
			      var html = ['<div style="padding-left: 5px;"><h4>'+entry+'</h4>'];
			      
			      if (data.data.length) {
				  var users = [];
				  for (var i=0; i<data.data.length; i++) {
				      for (var h=0; h<data.data[i][5].length; h++) {
					  users.push(data.data[i][5][h][0]+" ("+data.data[i][5][h][1]+") <button class='btn btn-mini btn-danger' title='revoke access' onclick='if(confirm(\"Really revoke access for this user?\")){Retina.WidgetInstances.home[1].revokeAccess(\"project\",\""+this.item+"\", \""+data.data[i][5][h][1]+"\");}'>&times;</button>");
					     }
					 }
					 html.push('This project has been assigned to the following users:<br><br><ul><li>'+users.join('</li><li>')+'</li></ul>');
				     } else {
					 html.push('This project is not yet assigned to any user.');
				     }

				     html.push('<h5>assign to user</h5><div class="input-append"><input type="text" placeholder="email address" id="shareEmail"><button class="btn" onclick="Retina.WidgetInstances.home[1].performShare(true, true);">assign</button></div><div id="shareResult"></div>');
				     
				     html.push('</div>');
				     
				     widget.browser.sections.detailSectionContent.innerHTML = html.join("");
				 }
			     },
			     error: function(jqXHR, error) {
				 var widget = Retina.WidgetInstances.home[1];
				 widget.main.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>An error occurred accessing the data server.</div>";
			     },
			     crossDomain: true,
			     headers: stm.authHeader
		    });
    };
    
    widget.preview = function (data) {
	var widget = Retina.WidgetInstances.home[1];

	widget.browser.preserveDetail = false;
	
	widget.currentFiles = [ data ];

	var html = ['<h4>'+data.node.file.name+'</h4><table style="text-align: left;">'];
	html.push('<tr><th style="padding-right: 20px;">project</th><td>'+data.node.attributes.project+'</td></tr>');
	html.push('<tr><th>group</th><td>'+data.node.attributes.group+'</td></tr>');
	html.push('<tr><th>sample</th><td>'+data.node.attributes.sample+'</td></tr>');
	html.push('<tr><th>name</th><td>'+data.node.attributes.name+'</td></tr>');
	html.push('<tr><th>created</th><td>'+data.node.file.created_on+'</td></tr>');
	html.push('<tr><th>MD5</th><td>'+data.node.file.checksum.md5+'</td></tr>');
	html.push('<tr><th>size</th><td>'+data.node.file.size.byteSize()+'</td></tr>');
	if (stm.user.admin) {
	    html.push('<tr><th>access</th><td id="accessData"><img src="Retina/images/waiting.gif" style="width: 16px;"></td></tr>');
	}
	html.push('</table>');
	
	html.push('<div style="width: 100%; text-align: center; margin-top: 20px;"><button class="btn pull-left" onclick="Retina.WidgetInstances.home[1].downloadSingle(\''+data.node.id+'\', \''+data.node.file.name+'\');"><img src="Retina/images/cloud-download.png" style="width: 16px;"> download</button>');

	if (stm.user.admin) {
	    html.push('</div>');
	    html.push(widget.shareAdmin());
	    jQuery.ajax({ url: RetinaConfig.auth_url + "?action=rights&type=file&item=" + data.node.id,
			  dataType: "json",
			  item: data.node.file.name,
			  itemid: data.node.id,
			  success: function(data) {
			      if (data.ERROR) {
				  document.getElementById('accessData').innerHTML = "<div class='alert alert-error' style='margin: 10px;'>An error occurred accessing your permissions:<br>"+data.ERROR+"</div>";
			      } else {
				  
				  if (data.data.length) {
				      var users = [];
				      for (var i=0; i<data.data.length; i++) {
					  for (var h=0; h<data.data[i][5].length; h++) {
					      users.push(data.data[i][5][h][0]+" ("+data.data[i][5][h][1]+") <button class='btn btn-mini btn-danger' title='revoke access' onclick='if(confirm(\"Really revoke access for this user?\")){Retina.WidgetInstances.home[1].revokeAccess(\"file\",\""+this.itemid+"\", \""+data.data[i][5][h][1]+"\");}'>&times;</button>");
					  }
				      }
				      document.getElementById('accessData').innerHTML = '<table><tr><td>'+users.join('</td></tr><tr><td>')+'</td></tr></table>';
				  } else {
				      document.getElementById('accessData').innerHTML = 'unassiged';
				  }
			      }
			  },
			  error: function(jqXHR, error) {
			      var widget = Retina.WidgetInstances.home[1];
			      widget.main.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>An error occurred accessing the data server.</div>";
			  },
			  crossDomain: true,
			  headers: stm.authHeader
			});
	} else {
	    html.push('<button class="btn pull-right" onclick="jQuery(\'#shareDiv\').toggle();"><img src="Retina/images/share.png" style="width: 18px; position: relative; bottom: 2px;"> sharing options</button></div>');
	    html.push(widget.share());
	}

	html.push('<div id="shareResult"></div>');
	
	return html.join("");
    };

    widget.multiPreview = function (files) {
	var widget = Retina.WidgetInstances.home[1];

	var fns = [];
	var total_size = 0;
	for (var i=0; i<files.length; i++) {
	    fns.push(files[i].file.name+" ("+files[i].file.size.byteSize()+")");
	    total_size += files[i].file.size;
	}

	widget.currentFiles = files;
	var html = ['<h4>Multiple File Selection</h4>'];
	html.push('<p>You have selected the '+files.length+' files below totalling '+total_size.byteSize()+'.</p>');
	html.push('<textarea disabled style="border: none; width: 350px; height: 220px; box-shadow: none; background-color: white; cursor: pointer;">'+fns.join('\n')+'</textarea>');
	html.push('<div style="width: 100%; text-align: center; margin-top: 20px;"><button class="btn pull-left" onclick="Retina.WidgetInstances.home[1].downloadMultiple();"><img src="Retina/images/cloud-download.png" style="width: 16px;"> download</button>');

	if (stm.user.admin) {
	    html.push('</div>');
	    html.push(widget.shareAdmin());
	} else {
	    html.push('<button class="btn pull-right" onclick="jQuery(\'#shareDiv\').toggle();"><img src="Retina/images/share.png" style="width: 18px; position: relative; bottom: 2px;"> sharing options</button></div>');
	    html.push(widget.share());
	}
	
	html.push('<div id="shareResult"></div>');
	
	return html.join("");
    };

    widget.downloadMultiple = function () {
	var widget = this;

	for (var i=0; i<widget.currentFiles.length; i++) {
	    widget.downloadSingle(widget.currentFiles[i].id, widget.currentFiles[i].file.name);
	}
    };

    widget.downloadSingle = function (node, name) {
	var widget = this;

	jQuery.ajax({ url: widget.browser.shockBase + "/node/" + node + "?download_url&filename="+name,
		      dataType: "json",
		      success: function(data) {
			  var widget = Retina.WidgetInstances.shockbrowse[1];
			  if (data != null) {
			      if (data.error != null) {
				  widget.sections.detailSectionContent.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>There was an error downloading the data: "+data.error+"</div>";
			      }
			      var w = window.open(data.data.url);
			      window.setTimeout(function(){
				  w.close();
			      }, 1000);
			  } else {
			      widget.sections.detailSectionContent.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>The data returned from the server was invalid.</div>";
			      console.log(data);
			  }
		      },
		      error: function(jqXHR, error) {
			  var widget = Retina.WidgetInstances.shockbrowse[1];
			  widget.sections.detailSectionContent.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>An error occurred downloading the data.</div>";
		      },
		      crossDomain: true,
		      headers: stm.authHeader
		    });
    };

    widget.getRights = function () {
	var widget = this;

	return jQuery.ajax({ url: RetinaConfig.auth_url + "?action=rights",
			     dataType: "json",
			     success: function(data) {
				 if (data.ERROR) {
				     var widget = Retina.WidgetInstances.home[1];
				     widget.main.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>An error occurred accessing your permissions:<br>"+data.ERROR+"</div>";
				 } else {
				     stm.DataStore.rights = data.data;
				 }
			     },
			     error: function(jqXHR, error) {
				 var widget = Retina.WidgetInstances.home[1];
				 widget.main.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>An error occurred accessing the data server.</div>";
			     },
			     crossDomain: true,
			     headers: stm.authHeader
			   });
    };

    widget.revokeAccess = function (type, id, email) {
	var widget = this;

	jQuery.ajax({ url: RetinaConfig.auth_url + "?action=modrights&email="+email+"&type="+type+"&item="+id+"&del=1",
		      dataType: "json",
		      success: function(data) {
			  var widget = Retina.WidgetInstances.home[1];
			  
			  alert('access revoked');
		      },
		      error: function(jqXHR, error) {
			  var widget = Retina.WidgetInstances.home[1];
		      },
		      crossDomain: true,
		      headers: stm.authHeader
		    });
    };

    widget.showSharedFolders = function (which) {
	var widget = this;

	var active = {};
	for (var i=0; i<stm.DataStore.rights.length; i++) {
	    if (stm.DataStore.rights[i][0] == 'project') {
		active[stm.DataStore.rights[i][1]] = true;
	    }
	}
	var entries = [];
	for (var i=0; i<widget.runs.length; i++) {
	    if (which == "all") {
		entries.push(widget.runs[i]);
	    }
	    else if (which == "assigned" && active[widget.runs[i]]) {
		entries.push(widget.runs[i]);
	    }
	    else if (which == "unassigned" && ! active[widget.runs[i]]) {
		entries.push(widget.runs[i]);
	    }
	}
	widget.browser.folderFilters[0].entries = entries;
	widget.browser.filter_section();
    };

    widget.showUsers = function () {
	var widget = this;

	document.getElementById('users').innerHTML = '<h3>Users</h3><div id="usertable" style="float: left; margin-right: 50px;"></div><div id="userdetails" style="float: left;"></div>';

	var data = [];
	for (var i=0; i<widget.users.length; i++) {
	    var row = jQuery.extend(true, [], widget.users[i]);
	    row[0] = '<span style="cursor: pointer; color: blue;" onclick="Retina.WidgetInstances.home[1].showDetails(\''+i+'\');">'+row[0]+'</span>';
	    data.push(row);
	}
	
	Retina.Renderer.create("table", {
	    target: document.getElementById('usertable'),
	    rows_per_page: 15,
	    filter_autodetect: true,
	    invisible_columns: {},
	    sort_autodetect: true,
	    synchronous: true,
	    sort: "name",
	    data: { data: data, header: widget.usercolumns }
	}).render();
    };

    widget.showDetails = function (index) {
	var widget = this;

	var user = {};
	for (var i=0; i<widget.usercolumns.length; i++) {
	    user[widget.usercolumns[i]] = widget.users[index][i];
	}

	widget.currentUser = user.email;

	var html = ['<h4>'+user.name+'</h4>'];
	html.push('<button class="btn" onclick="Retina.WidgetInstances.home[1].impersonateUser(\''+user.login+'\');">impersonate</button><div id="seluserRights"><div style="text-align: center;"><img src="Retina/images/waiting.gif" style="width: 16px; margin-top: 50px;"></div></div>');

	document.getElementById('userdetails').innerHTML = html.join('');

	widget.getRights().then(function () {
	    var widget = Retina.WidgetInstances.home[1];

	    var projects = [];
	    var groups = [];
	    var files = [];
	    for (var i=0; i<stm.DataStore.rights.length; i++) {
		var r = stm.DataStore.rights[i];
		for (var h=0; h<r[5].length; h++) {
		    if (r[5][h][1] == widget.currentUser) {
			if (r[0] == 'project') {
			    projects.push(r[1].split(/\|/)[1]);
			} else if (r[0] == 'group') {
			    groups.push(r[1].split(/\|/)[1])
			} else {
			    files.push(r[1].split(/\|/)[1]);
			}
		    }
		}
	    }

	    document.getElementById('seluserRights').innerHTML = '<h5>assigned projects</h5>'+projects.join('<br>')+'<h5>assigned groups</h5>'+groups.join('<br>')+'<h5>assigned files</h5>'+files.join('<br>');
	});
    };

    widget.impersonateUser = function (login) {
	var widget = this;

	jQuery.ajax({ url: RetinaConfig.auth_url + "?action=impersonate&login="+login,
		      dataType: "json",
		      success: function(data) {
			  var widget = Retina.WidgetInstances.home[1];
			  
			  if (data.data) {
			      jQuery.cookie('SeqWebSession', JSON.stringify(data.data), { path: '/' });
			      window.location.reload();
			  } else {
			      alert('impersonation failed');
			  }
		      },
		      error: function(jqXHR, error) {
			  var widget = Retina.WidgetInstances.home[1];

			  alert('impersonation failed');
		      },
		      crossDomain: true,
		      headers: stm.authHeader
		    });
    };
    
})();
