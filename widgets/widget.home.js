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

	    document.getElementById('login_space').innerHTML = '<button title="click to log out" class="btn btn-inverse" onclick="logout();" style="margin-right: 30px; position: relative; top: 10px;"><span class="btn btn-danger btn-mini" style="margin-left: 5px;position: relative;float: right;left: 5px;"><i class="icon icon-white icon-off"></i></span>'+stm.user.name+'</button>';
	    
	    if (stm.user.admin) {
		widget.getRights();
		widget.main.innerHTML = "<p><div class='btn-group' data-toggle='buttons-radio'><button class='btn active' onclick='Retina.WidgetInstances.home[1].showSharedFolders(\"all\");'>show all</button><button class='btn' onclick='widget.getRights().then(function(){Retina.WidgetInstances.home[1].showSharedFolders(\"assigned\")});'>show assigned</button><button class='btn' onclick='widget.getRights().then(function(){Retina.WidgetInstances.home[1].showSharedFolders(\"unassigned\")});'>show unassigned</button><button class='btn' onclick='Retina.WidgetInstances.home[1].showSharedFolders(\"partial\");'>show partially assigned</button></div></p><div id='shock'></div><div style='clear: both; height: 50px;'></div><div id='users'></div>";

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
				      "activateFolderfilterCallback": widget.highlight,
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
				      for (var i=0; i<widget.users.length; i++) {
					  if (widget.users[i][4] != 'yes') {
					      widget.users[i][4] = '<button class="btn btn-mini" onclick="Retina.WidgetInstances.home[1].resendConfirmation('+i+');">resend confirmation</button>';
					  }
				      }
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

			var projects = [];
			var groups = [];
			var files = [];
			var presetFilters = null;
			for (var i=0; i<stm.DataStore.rights.length; i++) {
			    if (stm.DataStore.rights[i][0] == 'project') {
				projects.push([stm.DataStore.rights[i][1].split(/\|/)[1],stm.DataStore.rights[i][1].split(/\|/)[1]+'&project_id='+stm.DataStore.rights[i][1].split(/\|/)[0]]);
				if (! presetFilters) {
				    presetFilters = { "type": "run-folder-archive-fastq", "project": stm.DataStore.rights[i][1].split(/\|/)[1]+"&project_id="+stm.DataStore.rights[i][1].split(/\|/)[0] };
				}
			    } else if (stm.DataStore.rights[i][0] == "group") {
				groups.push([stm.DataStore.rights[i][1].split(/\|/)[1],stm.DataStore.rights[i][1].split(/\|/)[1]+'&project_id='+stm.DataStore.rights[i][1].split(/\|/)[0]]);
				if (! presetFilters) {
				    presetFilters = { "type": "run-folder-archive-fastq", "group": stm.DataStore.rights[i][1].split(/\|/)[1]+"&project_id="+stm.DataStore.rights[i][1].split(/\|/)[0] };
				}
			    } else if (stm.DataStore.rights[i][0] == "file") {
				files.push([stm.DataStore.rights[i][1].split(/\|/)[1],stm.DataStore.rights[i][1].split(/\|/)[1]+'&project_id='+stm.DataStore.rights[i][1].split(/\|/)[0]]);
				if (! presetFilters) {
				    presetFilters = { "type": "run-folder-archive-fastq", "name": stm.DataStore.rights[i][1].split(/\|/)[1]+"&project_id="+stm.DataStore.rights[i][1].split(/\|/)[0] };
				}
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
			    "folderFilters": [ { "dropdown": false, "attribute": "project", "title": "project", "entries": projects, "filterable": true, "active": null },
					       { "dropdown": false, "attribute": "group", "title": "group", "entries": groups, "filterable": true, "active": null },
					       { "dropdown": false, "attribute": "name", "title": "file", "entries": files, "filterable": true, "active": null } ],
			    "detailType": "preview",
			    "customPreview": widget.preview,
			    "customMultiPreview": widget.multiPreview,
			    "presetFilters": presetFilters,
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

    widget.highlight = function () {
	var widget = Retina.WidgetInstances.home[1];

	var fl = widget.browser.fileList;
	var projects = {};
	var groups = {};
	var files = {};
	for (var i=0; i<stm.DataStore.rights.length; i++) {
	    var r = stm.DataStore.rights[i];
	    if (r[0] == 'group') {
		groups[r[1]] = true;
	    } else if (r[0] == 'file') {
		files[r[1]] = true;
	    } else if (r[0] == 'project') {
		projects[r[1]] = true;
	    }
	}
	
	for (var i=0; i<fl.length; i++) {
	    var atts = fl[i].attributes;
	    if (projects[atts.project_id + "|" + atts.project] || groups[atts.project_id+"|"+atts.group] || files[atts.project_id+"|"+atts.name]) {
		jQuery(widget.browser.sections.fileSection.firstChild.childNodes[i+1]).addClass('alert-success');
	    }
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

	html.push('<div style="clear: both; text-align: center; padding-top: 15px; margin-bottom: -15px;"><button class="btn btn-danger" onclick="if(confirm(\'Really delete all selected files? This cannot be undone!\')){Retina.WidgetInstances.shockbrowse[1].'+(Retina.WidgetInstances.shockbrowse[1].selectedFile ? 'removeNode({node:\''+Retina.WidgetInstances.shockbrowse[1].selectedFile.getAttribute('fi')+'\'})' : 'removeMultipleNodes()')+';}" id="shockbrowserMultiDeleteButton"><i class="icon icon-trash" style="margin-right: 5px;"></i>delete</button></div><div id="shockbrowserMultiProgressDiv"></div>');
	
	html.push('<div id="shareDiv" style="clear: both; padding-top: 20px;">');
	html.push('<h4>What do you want to assign?</h4><ul style="list-style-type: none;">');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharewhat" checked value="project" id="shareProject">this project ('+atts.project+')</li>');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharewhat" value="group" id="shareGroup">this group ('+atts.group+')</li>');
	html.push('<li><input style="position: relative; bottom: 3px; margin-right: 5px;" type="radio" name="sharewhat" value="file" id="shareFile">the selected file'+(widget.currentFiles.length > 1 ? "s" : "")+'</li>');
	html.push('</ul>');
	html.push('<h4>Custom message</h4><textarea id="admin_message"></textarea>');
	html.push('<h4>Who is the customer?</h4>');
	html.push('<div class="input-append"><input type="text" placeholder="email address" id="shareEmail"><button class="btn" onclick="Retina.WidgetInstances.home[1].performShare(true);">share</button></div>');
	html.push('</div>');

	return html.join("");
    };

    widget.performShare = function (assign) {
	var widget = this;

	var dataType = document.getElementById('shareProject').checked ? "project" : (document.getElementById('shareGroup').checked ? "group" : "file");
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
	var url = RetinaConfig.shock_url + "/node/?query&download_url&archive=zip&";
	if (dataType == 'project') {
	    var node = widget.currentFiles[0].node ? widget.currentFiles[0].node : widget.currentFiles[0];
	    entries.push(node.attributes.project_id+'|'+node.attributes.project);
	    url += "project="+node.attributes.project+"&project_id="+node.attributes.project_id;
	} else if (dataType == 'group') {
	    var node = widget.currentFiles[0].node ? widget.currentFiles[0].node : widget.currentFiles[0];
	    entries.push(node.attributes.project_id+'|'+node.attributes.group);
	    url += "group="+node.attributes.group+"&project_id="+node.attributes.project_id;
	} else {
	    var ids = [];
	    var fns = [];
	    currentFileShareItems = [];
	    var n = widget.currentFiles[0].node ? widget.currentFiles[0].node : widget.currentFiles[0];
	    var item = n.attributes.project_id + '|';
	    for (var i=0; i<widget.currentFiles.length; i++) {
		var node = widget.currentFiles[i].node ? widget.currentFiles[i].node : widget.currentFiles[i];
		ids.push(node.id);
		currentFileShareItems.push(item+node.file.name);
		fns.push(node.attributes.project_id+"|"+node.attributes.project+"|"+node.attributes.group+"|"+node.attributes.name);
	    }
	    var data = 'download_url=1&archive_format=zip&ids='+ids.join(",")+"&sharenames="+fns.join(",");
	    jQuery.ajax({
		method: "POST",
		url: RetinaConfig.shock_url + "/node/",
		data: data,
		success: function(data) {
		    var widget = Retina.WidgetInstances.home[1];
		    var dynamic = RetinaConfig.shock_preauth+data.data.url.substring(data.data.url.lastIndexOf('/'));
		    if (document.getElementById('admin_message') && document.getElementById('admin_message').value) {
			dynamic += "<br><br><b>"+encodeURIComponent(document.getElementById('admin_message').value)+"</b>";
		    }
		    jQuery.ajax({ url: RetinaConfig.auth_url + "?action=modrights&dynamic="+dynamic+"&email="+email+"&type="+dataType+"&item="+currentFileShareItems.join('&item=')+"&view=1&edit="+(assign ? "1" : "0")+"&add=1&owner="+(shareType == "admin" ? 1 : 0),
				  dataType: "json",
				  item: currentFileShareItems.join(", "),
				  success: function(data) {
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
		},
		error: function(jqXHR, error) {
		    var widget = Retina.WidgetInstances.home[1];
		    console.log(jqXHR.responseText);
		},
		crossDomain: true,
		headers: stm.authHeader
	    });
	    return;
	}

	jQuery.ajax({
	    url: url,
	    dataType: "json",
	    method: 'POST',
	    success: function(data) {
		var widget = Retina.WidgetInstances.home[1];
		var dynamic = RetinaConfig.shock_preauth+data.data.url.substring(data.data.url.lastIndexOf('/'));
		if (document.getElementById('admin_message') && document.getElementById('admin_message').value) {
		    dynamic += "<br><br><b>"+encodeURIComponent(document.getElementById('admin_message').value)+"</b>";
		}
		jQuery.ajax({ url: RetinaConfig.auth_url + "?action=modrights&dynamic="+dynamic+"&email="+email+"&type="+dataType+"&item="+entries[0]+"&view=1&edit="+(assign ? "1" : "0")+"&add=1&owner="+(shareType == "admin" ? 1 : 0),
			      dataType: "json",
			      item: dataType=='project' ? entries[0] : (widget.currentFiles[0].node ? widget.currentFiles[0].node.file.name : widget.currentFiles[0].file.name),
			      success: function(data) {
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
	    },
	    error: function(jqXHR, error) {
		var widget = Retina.WidgetInstances.home[1];
		console.log(jqXHR.responseText);
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
	    html.push('<tr><th style="vertical-align: top;">access</th><td id="accessData"><img src="Retina/images/waiting.gif" style="width: 16px;"></td></tr>');
	}
	html.push('</table>');
	
	html.push('<div style="width: 100%; text-align: center; margin-top: 20px;"><button class="btn pull-left" id="downloadButton" onclick="Retina.WidgetInstances.home[1].downloadSingle(\''+data.node.id+'\', \''+data.node.file.name+'\');"><img src="Retina/images/cloud-download.png" style="width: 16px;"> download</button>');

	html.push('<button class="btn pull-left" style="margin-left: 10px;" id="downloadLinkButton" onclick="Retina.WidgetInstances.home[1].downloadLinkSingle(\''+data.node.id+'\', \''+data.node.file.name+'\');"><img src="Retina/images/ftp.png" style="width: 16px;"> download link</button>');
	
	if (stm.user.admin) {
	    html.push('</div>');
	    html.push(widget.shareAdmin());
	    var promises = [];
	    widget.selectedFileRightsData = {};
	    promises.push(jQuery.ajax({ url: RetinaConfig.auth_url + "?action=rights&type=project&item=" + data.node.attributes.project_id+"|"+data.node.attributes.project,
					dataType: "json",
					success: function(data) {
					    Retina.WidgetInstances.home[1].selectedFileRightsData['project'] = data.data;
					},
					crossDomain: true,
					headers: stm.authHeader}));
	    promises.push(jQuery.ajax({ url: RetinaConfig.auth_url + "?action=rights&type=group&item=" + data.node.attributes.project_id+"|"+data.node.attributes.group,
					dataType: "json",
					success: function(data) {
					    Retina.WidgetInstances.home[1].selectedFileRightsData['group'] = data.data;
					},
					crossDomain: true,
					headers: stm.authHeader}));
	    promises.push(jQuery.ajax({ url: RetinaConfig.auth_url + "?action=rights&type=file&item=" + data.node.attributes.project_id+"|"+data.node.file.name,
					dataType: "json",
					success: function(data) {
					    Retina.WidgetInstances.home[1].selectedFileRightsData['file'] = data.data;
					},
					crossDomain: true,
					headers: stm.authHeader}));

	    jQuery.when.apply(this, promises).then(function() {
		var d = Retina.WidgetInstances.home[1].selectedFileRightsData;
		var html = [];
		if (d.project.length) {
		    html.push('<table><tr><th>project</th></tr>')
		    for (var i=0; i<d.project.length; i++) {
			for (var h=0; h<d.project[i][5].length; h++) {
			    html.push('<tr><td>'+d.project[i][5][h][0]+" ("+d.project[i][5][h][1]+") <button class='btn btn-mini btn-danger' title='revoke access' onclick='if(confirm(\"Really revoke access for this user?\")){Retina.WidgetInstances.home[1].revokeAccess(\"project\",\""+d.project[i][1]+"\", \""+d.project[i][5][h][1]+"\");}'>&times;</button></td></tr>")
			}
		    }
		    html.push('</table>');
		} else {
		    html.push('<i>- project not shared - </i><br>');
		}
		if (d.group.length) {
		    html.push('<table><tr><th>group</th></tr>')
		    for (var i=0; i<d.group.length; i++) {
			for (var h=0; h<d.group[i][5].length; h++) {
			    html.push('<tr><td>'+d.group[i][5][h][0]+" ("+d.group[i][5][h][1]+") <button class='btn btn-mini btn-danger' title='revoke access' onclick='if(confirm(\"Really revoke access for this user?\")){Retina.WidgetInstances.home[1].revokeAccess(\"group\",\""+d.group[i][1]+"\", \""+d.group[i][5][h][1]+"\");}'>&times;</button></td></tr>");
			}
		    }
		    html.push('</table>');
		} else {
		    html.push('<i>- group not shared -</i><br>');
		}
		if (d.file.length) {
		    html.push('<table><tr><th>file</th></tr>')
		    for (var i=0; i<d.file.length; i++) {
			for (var h=0; h<d.file[i][5].length; h++) {
			    html.push('<tr><td>'+d.file[i][5][h][0]+" ("+d.file[i][5][h][1]+") <button class='btn btn-mini btn-danger' title='revoke access' onclick='if(confirm(\"Really revoke access for this user?\")){Retina.WidgetInstances.home[1].revokeAccess(\"file\",\""+d.file[i][1]+"\", \""+d.file[i][5][h][1]+"\");}'>&times;</button></td></tr>")
			}
		    }
		    html.push('</table>');
		} else {
		    html.push('<i>- file not shared -</i><br>');
		}
		
		document.getElementById('accessData').innerHTML = html.join('');
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
	html.push('<div style="width: 100%; text-align: center; margin-top: 20px;"><button class="btn pull-left" onclick="Retina.WidgetInstances.home[1].downloadMultiple();" id="downloadButton"><img src="Retina/images/cloud-download.png" style="width: 16px;"> download</button>');

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

	document.getElementById('downloadButton').innerHTML = '<img src="Retina/images/waiting.gif" style="width: 16px;">';
	document.getElementById('downloadButton').setAttribute('disabled', 'disabled');
	
	var ids = []
	var fns = [];
	for (var i=0; i<widget.currentFiles.length; i++) {
	    ids.push(widget.currentFiles[i].id);
	    fns.push(widget.currentFiles[i].attributes.project_id+"|"+widget.currentFiles[i].attributes.project+"|"+widget.currentFiles[i].attributes.group+"|"+widget.currentFiles[i].attributes.name);
	}
	var data = 'download_url=1&archive_format=zip&ids='+ids.join(",")+"&sharenames="+fns.join(",");
	jQuery.ajax({
	    method: "POST",
	    url: RetinaConfig.shock_url + "/node/",
	    data: data,
	    success: function(data) {
		var url = RetinaConfig.shock_preauth+data.data.url.substring(data.data.url.lastIndexOf('/'));
		var link = document.createElement('a');
		link.setAttribute('href', url);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		document.getElementById('downloadButton').innerHTML = '<img src="Retina/images/cloud-download.png" style="width: 16px;"> download';
		document.getElementById('downloadButton').removeAttribute('disabled');
	    },
	    error: function(jqXHR, error) {
		var widget = Retina.WidgetInstances.home[1];
		widget.sections.detailSectionContent.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>An error occurred downloading the data.</div>";
		document.getElementById('downloadButton').innerHTML = '<img src="Retina/images/cloud-download.png" style="width: 16px;"> download';
		document.getElementById('downloadButton').removeAttribute('disabled');
	    },
	    crossDomain: true,
	    headers: stm.authHeader
	});
    };

    widget.downloadSingle = function (node, name) {
	var widget = this;

	document.getElementById('downloadButton').innerHTML = '<img src="Retina/images/waiting.gif" style="width: 16px;">';
	document.getElementById('downloadButton').setAttribute('disabled', 'disabled');
	name = name.replace(/\.gz$/, "");
	jQuery.ajax({ url: widget.browser.shockBase + "/node/" + node + "?download_url&filename="+name, // &compression=gzip
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
			  document.getElementById('downloadButton').innerHTML = '<img src="Retina/images/cloud-download.png" style="width: 16px;"> download';
			  document.getElementById('downloadButton').removeAttribute('disabled');
		      },
		      error: function(jqXHR, error) {
			  var widget = Retina.WidgetInstances.shockbrowse[1];
			  widget.sections.detailSectionContent.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>An error occurred downloading the data.</div>";
			  document.getElementById('downloadButton').innerHTML = '<img src="Retina/images/cloud-download.png" style="width: 16px;"> download';
			  document.getElementById('downloadButton').removeAttribute('disabled');
		      },
		      crossDomain: true,
		      headers: stm.authHeader
		    });
    };

    widget.downloadLinkSingle = function (node, name) {
	var widget = this;

	document.getElementById('downloadLinkButton').innerHTML = '<img src="Retina/images/waiting.gif" style="width: 16px;">';
	document.getElementById('downloadLinkButton').setAttribute('disabled', 'disabled');
	
	jQuery.ajax({ url: widget.browser.shockBase + "/node/" + node + "?download_url&filename="+name, // &compression=gzip
		      dataType: "json",
		      success: function(data) {
			  var widget = Retina.WidgetInstances.shockbrowse[1];
			  if (data != null) {
			      if (data.error != null) {
				  widget.sections.detailSectionContent.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>There was an error downloading the data: "+data.error+"</div>";
			      }
			      alert("Your download URL is\n\n"+data.data.url+"\n\nIt is valid for one time download.");
			  } else {
			      widget.sections.detailSectionContent.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>The data returned from the server was invalid.</div>";
			      console.log(data);
			  }
			  document.getElementById('downloadLinkButton').innerHTML = '<img src="Retina/images/ftp.png" style="width: 16px;"> download';
			  document.getElementById('downloadLinkButton').removeAttribute('disabled');
		      },
		      error: function(jqXHR, error) {
			  var widget = Retina.WidgetInstances.shockbrowse[1];
			  widget.sections.detailSectionContent.innerHTML = "<div class='alert alert-error' style='margin: 10px;'>An error occurred downloading the data.</div>";
			  document.getElementById('downloadLinkButton').innerHTML = '<img src="Retina/images/ftp.png" style="width: 16px;"> download';
			  document.getElementById('downloadLinkButton').removeAttribute('disabled');
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
				 console.log(jqXHR);
				 console.log(error);
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
	var partial = {};
	for (var i=0; i<stm.DataStore.rights.length; i++) {
	    if (stm.DataStore.rights[i][0] == 'project') {
		active[stm.DataStore.rights[i][1].split(/\|/)[0]] = true;
	    }
	    else if (stm.DataStore.rights[i][0] == 'group' || stm.DataStore.rights[i][0] == 'file') {
		partial[stm.DataStore.rights[i][1].split(/\|/)[0]] = true;
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
	    else if (which == "unassigned" && (! active[widget.runs[i]] && ! partial[widget.runs[i]])) {
		entries.push(widget.runs[i]);
	    }
	    else if (which == "partial" && partial[widget.runs[i]] && ! active[widget.runs[i]]) {
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

    widget.resendConfirmation = function (id) {
	var widget = this;

	var user = widget.users[id][0];

	jQuery.ajax({ url: RetinaConfig.auth_url + "?action=reconfirm&login="+user,
		      dataType: "json",
		      success: function(data) {
			  var widget = Retina.WidgetInstances.home[1];
			  if (! data.error) {
			      alert('confirmation email resent');
			  } else {
			      alert('resending confirmation failed: '+data.ERROR);
			  }
		      },
		      error: function(jqXHR, error) {
			  var widget = Retina.WidgetInstances.home[1];
			  try {
			      var error = JSON.parse(jqXHR.responseText).ERROR;
			      alert('resending confirmation failed: '+error);
			  } catch (error) {
			      alert('there was an error sending the confirmation email');
			  }
		      },
		      crossDomain: true,
		      headers: stm.authHeader
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
