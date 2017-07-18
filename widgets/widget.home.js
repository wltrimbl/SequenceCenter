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
		widget.main.innerHTML = "<p></p><div id='shock'></div>";

		jQuery.ajax({ url: RetinaConfig.shock_url + "/node/?query&type=run-folder-archive-fastq&distinct=project_id",
			      dataType: "json",
			      success: function(data) {
				  var widget = Retina.WidgetInstances.home[1];
				  var entries = data.data.sort();
				  
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
				      "width": 1200,
				      "detailType": "preview",
				      "customPreview": widget.previewAdmin,
				      "customMultiPreview": widget.multiPreviewAdmin,
				      "activateFolderfilterCallback": widget.projectSelected,
				      "folderFilters": [ { "dropdown": false, "attribute": "project_id", "title": "project", "entries": entries, "filterable": true } ],    
				      "presetFilters": { "type": "run-folder-archive-fastq", "project_id": entries[0]  },
				      "disableCustomFilter": true,
				      "height": 730,
				      "fileSectionColumns": [
					  { "path": "file.name", "name": "Name", "width": "remain", "type": "file", "sortable": true },
					  { "path": "file.size", "name": "Size", "width": "100px", "type": "size", "align": "right", "sortable": true },
					  { "path": "created_on", "name": "Date Created", "width": "160px", "type": "date", "align": "left", "sortable": true }
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
		
	    } else {

		widget.main.innerHTML = "<h3>Data Download Section</h3><p>The data browser below gives you access to all of your files.<ul><li>select a project on the left</li><li>click a file for details</li><li>use shift to select multiple files</li><li>click the download button to download</li></ul></p><div id='shock'></div>";
		
		widget.getRights().then( function () {
		    var widget = Retina.WidgetInstances.home[1];
		    
		    if (stm.DataStore.hasOwnProperty('rights')) {

			var entries = [];
			for (var i=0; i<stm.DataStore.rights.length; i++) {
			    if (stm.DataStore.rights[i][0] == 'project') {
				entries.push(stm.DataStore.rights[i][1]);
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
			    "width": 1200,
			    "folderFilters": [ { "dropdown": false, "attribute": "project_id", "title": "project", "entries": entries, "filterable": true } ],
			    "detailType": "preview",
			    "customPreview": widget.preview,
			    "customMultiPreview": widget.multiPreview,
			    "presetFilters": { "type": "run-folder-archive-fastq", "project_id": entries[0] },
			    "disableCustomFilter": true,
			    "height": 730,
			    "fileSectionColumns": [
				{ "path": "file.name", "name": "Name", "width": "remain", "type": "file", "sortable": true },
				{ "path": "file.size", "name": "Size", "width": "100px", "type": "size", "align": "right", "sortable": true },
				{ "path": "created_on", "name": "Date Created", "width": "160px", "type": "date", "align": "left", "sortable": true }
			    ]
			});
			widget.browser.loginAction({ "action": "login", "result": "success", "user": stm.user, "authHeader": stm.authHeader });
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

	html.push('<div id="shareDiv" style="display: none; clear: both; padding-top: 20px;">');
	html.push('<h4>What do you want to share?</h4><ul style="list-style-type: none;">');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharewhat" checked value="project" id="shareProject">this project</li>');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharewhat" value="file">the selected file'+(widget.currentFiles.length > 1 ? "s" : "")+'</li>');
	html.push('</ul>');
	html.push('<h4>How do you want to share?</h4><ul style="list-style-type: none;">');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharehow" checked value="view" id="shareView">the user can only view / download</li>');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharehow" value="shareable">the user can share with others</li>');
//	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharehow" value="once" id="shareOnce">the user can download exactly once</li>');
	html.push('</ul>');
	html.push('<h4>Who do you want to share with?</h4>');
	html.push('<div class="input-append"><input type="text" placeholder="email address" id="shareEmail"><button class="btn" onclick="Retina.WidgetInstances.home[1].performShare();">share</button></div>');
	html.push('</div>');

	return html.join("");
    };

    widget.performShare = function () {
	var widget = this;

	var dataType = document.getElementById('shareProject').checked ? "project" : "file";
	var shareType = document.getElementById('shareView').checked ? "view" : (document.getElementById('shareOnce').checked ? "once" : "admin");
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
	    entries.push(widget.browser.filters.project);
	} else {
	    for (var i=0; i<widget.currentFiles; i++) {
		entries.push(widget.currentFiles[i].node.id);
	    }
	}

	for (var i=0; i<entries.length; i++) {
	    jQuery.ajax({ url: RetinaConfig.auth_url + "?action=modrights&email="+email+"&type="+dataType+"&item="+entries[i]+"&view=1&edit=0&owner="+(shareType == "admin" ? 1 : 0),
			  dataType: "json",
			  success: function(data) {
			      var widget = Retina.WidgetInstances.home[1];
			  },
			  error: function(jqXHR, error) {
			      var widget = Retina.WidgetInstances.home[1];
			  },
			  crossDomain: true,
			  headers: stm.authHeader
			});
	}
    };

    widget.previewAdmin = function (data) {
	var widget = Retina.WidgetInstances.home[1];

	return "";
    };

    widget.multiPreviewAdmin = function (data) {
	var widget = Retina.WidgetInstances.home[1];

	return "";
    };

    widget.projectSelected = function (entry) {
	Retina.WidgetInstances.home[1].currentProject = entry;
	jQuery.ajax({ url: RetinaConfig.auth_url + "?action=rights&type=project&item=" + entry,
			     dataType: "json",
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
						 users.push(data.data[i][5][h][0]+" ("+data.data[i][5][h][1]+")");
					     }
					 }
					 html.push('This project has been assigned to the following users:<br><br><ul><li>'+users.join('</li><li>')+'</li></ul>');
				     } else {
					 html.push('This project is not yet assigned to any user.');
				     }

				     html.push('<h5>assign to user</h5><div class="input-append"><input type="text" placeholder="email address" id="assignEmail"><button class="btn" onclick="Retina.WidgetInstances.home[1].performAssign();">assign</button></div><div id="assignResult"></div>');
				     
				     html.push('</div>');
				     
				     widget.browser.sections.detailSection.innerHTML = html.join("");
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

    widget.performAssign = function () {
	var widget = this;

	var email = document.getElementById('assignEmail').value;
	document.getElementById('assignResult').innerHTML = '<div style="width: 100%; text-align: middle; padding-top: 100px;"><img src="Retina/images/waiting.gif" style="width: 24px;"></div>';

	jQuery.ajax({ url: RetinaConfig.auth_url + "?action=modrights&email="+email+"&type=project&item="+widget.currentProject+"&view=1&edit=1&owner=1&add=1",
		      dataType: "json",
		      success: function(data) {
			  var widget = Retina.WidgetInstances.home[1];
			  document.getElementById('assignResult').innerHTML = '<div class="alert alert-success">user added</div>';
		      },
		      error: function(jqXHR, error) {
			  var widget = Retina.WidgetInstances.home[1];
			  var errorText = "could not reach permission server";
			  try {
			      errorText = JSON.parse(jqXHR.responseText).ERROR;
			  } catch (e) {

			  }
			  document.getElementById('assignResult').innerHTML = '<div class="alert alert-error">'+errorText+'</div>';
		      },
		      crossDomain: true,
		      headers: stm.authHeader
		    });
    };
    
    widget.preview = function (data) {
	var widget = Retina.WidgetInstances.home[1];

	widget.currentFiles = [ data ];

	var html = ['<h4>'+data.node.file.name+'</h4><table style="text-align: left;">'];
	html.push('<tr><th style="padding-right: 20px;">project</th><td>'+data.node.attributes.project+'</td></tr>');
	html.push('<tr><th>sample</th><td>'+data.node.attributes.sample+'</td></tr>');
	html.push('<tr><th>name</th><td>'+data.node.attributes.name+'</td></tr>');
	html.push('<tr><th>created</th><td>'+data.node.file.created_on+'</td></tr>');
	html.push('<tr><th>MD5</th><td>'+data.node.file.checksum.md5+'</td></tr>');
	html.push('<tr><th>size</th><td>'+data.node.file.size.byteSize()+'</td></tr>');
	html.push('</table>');
	
	html.push('<div style="width: 100%; text-align: center; margin-top: 20px;"><button class="btn pull-left" onclick="Retina.WidgetInstances.home[1].downloadSingle(\''+data.node.id+'\', \''+data.node.file.name+'\');"><img src="Retina/images/cloud-download.png" style="width: 16px;"> download</button><button class="btn pull-right" onclick="jQuery(\'#shareDiv\').toggle();"><img src="Retina/images/share.png" style="width: 18px; position: relative; bottom: 2px;"> sharing options</button></div>');
	
	html.push(widget.share());
	
	return html.join("");
    };

    widget.multiPreview = function (files) {
	var widget = Retina.WidgetInstances.home[1];

	var fns = [];
	var total_size = 0;
	for (var i=0; i<files.length; i++) {
	    fns.push(files[i].file.name);
	    total_size += files[i].file.size;
	}

	widget.currentFiles = files;
	var html = ['<h4>Multiple File Selection</h4>'];
	html.push('<p>You have selected the '+files.length+' files below totalling '+total_size.byteSize()+'.</p>');
	html.push('<textarea disabled style="border: none; width: 350px; height: 220px; box-shadow: none; background-color: white; cursor: pointer;">'+fns.join('\n')+'</textarea>');
	html.push('<div style="width: 100%; text-align: center; margin-top: 20px;"><button class="btn pull-left" onclick="Retina.WidgetInstances.home[1].downloadMultiple();"><img src="Retina/images/cloud-download.png" style="width: 16px;"> download</button><button class="btn pull-right" onclick="jQuery(\'#shareDiv\').toggle();"><img src="Retina/images/share.png" style="width: 18px; position: relative; bottom: 2px;"> sharing options</button></div>');

	html.push(widget.share());

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
    
})();
