(function($, window){
	var text_tpl = {
		'rightplain' : [
                     '<div class="plain">',
                          '<pre  class="js_message_plain ng-binding">{content}</pre>',
                          '<img alt="" style="display:none" src="https://res.wx.qq.com/zh_CN/htmledition/v2/images/icon/ico_loading28a2f7.gif" class="ico_loading" > <i title="{error}"   class="ico_fail web_wechat_message_fail" style="display:none;"></i>',
					'</div>'
		],
		'rightpicture' : [
					'<div class="picture">',
	                       '<a href="{content}" target="_blank"><img class="msg-img" src="{content}" style="width: 100px;"></a>',
	                       '<i class="arrow"></i>',
	                       '<p class="loading ng-hide">',
	                            '<img src="https://res.wx.qq.com/zh_CN/htmledition/v2/images/icon/ico_loading28a2f7.gif"><i title="{error}"   class="ico_fail web_wechat_message_fail" style="display:none;"></i>',
	                        '</p>',
	              	'</div>'
		],
		'leftplain':[
					'<div class="plain">',
						'<pre class="js_message_plain ng-binding">{content}</pre>',
						//'<img alt="" src="/images/ico_loading28a2f7.gif" class="ico_loading ng-hide" >',
						//'<i title="重新发送" class="ico_fail web_wechat_message_fail ng-hide"></i>',
					'</div>',
			],
		'leftpicture':[
					'<div class="picture">',
			        	'<a href="{content}" target="_blank"><img class="msg-img" src="{content}" style="width: 100px;"></a>',
						'<i class="arrow"></i>',
						'<p class="loading ng-hide">',
							'<img alt="" src="https://res.wx.qq.com/zh_CN/htmledition/v2/images/icon/ico_loading28a2f7.gif">',
						'</p>',
					'</div>'
			]
	};

	var CurrentVoice = null, CurrentContent = null;


	var chattpl = [
		'<div  class="ng-scope chat_list_item">',
			'<div message-directive="" class="clearfix">',
				'<div  style="overflow: hidden;" on="message.MsgType" ng-switch="">',
					'<div  class="message ng-scope me" ng-switch-default="">',
						'<img src="http://admin.6renyou.com/statics/socketchat/img/six-service.jpg" class="avatar">',
						'<div class="content">',
							'<h4 class="nickname ng-binding ng-scope" style="width:auto;margin-right:10px;font-size:14px;font-weight:normal;">{opid}</h4>',
							'<div class="bubble js_message_bubble ng-scope bubble_primary right">',
								'<div  class="bubble_cont ng-scope">',
									'{main_content}',
								'</div>',
                    		'</div>',
                  		'</div>',
                	'</div>',
              	'</div>',
            '</div>',
       '</div>'
	];

	chattpl = chattpl.join('')


	var chatlefttpl = [
	'<div class="ng-scope chat_list_item">',
		'<div class="clearfix">',
			'<div style="overflow: hidden;" on="message.MsgType" ng-switch="">',
				'<div class="message ng-scope you" ng-switch-default="">',
					'<img src="{headurl}" class="avatar">',
					'<div class="content">',
						'<div class="bubble js_message_bubble ng-scope bubble_default left">',
							'<div class="bubble_cont ng-scope">',
								'{main_content}',
							'</div>',
						'</div>',
					'</div>',
				'</div>',
			'</div>',
		'</div>',
	'</div>'
	];
	chatlefttpl = chatlefttpl.join('');

	var usertpl = [
			'<div class="ng-scope useritem useritem_{openid}">',
                '<div class="chat_item slide-left ng-scope {active}" source="{source}" openid="{openid}" openid_name="{username}">',
                  '<div class="avatar"> ',
					  '<img src="{headurl}" class="img"> ',
					  '<i style="{number_display}" class="unread_number {openid}_unread_number icon web_wechat_reddot_middle ng-binding ng-scope">{number}</i>',
				  '</div>',
                  '<div class="info">',
                    '<h3 class="nickname"> <span  class="nickname_text ng-binding">{username}</span> </h3>',
                    '<p class="msg ng-scope"> <span class="ng-binding">{lastmsg}</span> </p>',
                  '</div>',
                '</div>',
              '</div>'
	];
	usertpl = usertpl.join('');

	var addUserItem = function(username, lastmsg, active, number, openid, msgtype, headurl, source){
		switch(parseInt(msgtype)){
			case MSG_TYPE_IMAGE:
				lastmsg = "[图片]";
				break;
			case MSG_TYPE_AUDIO:
				lastmsg = "[语音]";
				break;
		}
		var data = {
			openid:openid,
			username : username,
			lastmsg : lastmsg,
			active : active ? "active" : '',
			number : number,
			source:source,
			headurl : headurl == '' ? 'http://admin.6renyou.com/statics/socketchat/img/default-user.jpg' : headurl,
			number_display:number > 0 ? 'display:' : 'display:none'
		};
		$('.UserContainer').before(usertpl.replaceTpl(data));	
	};

	var CurrentOpenid = '';
	var CurrentSource = '';
	var CurrentHeadurl = 'http://admin.6renyou.com/statics/socketchat/img/default-user.jpg';

	var addChatItem = function(content, media_id, msg_type){
		var user = "";
		if(!content){
			content = $('#editArea').val();
			$('#editArea').val('');
			user = USER;
			if(CurrentOpenid == ''){
				alert('当前没有用户');
				return;
			}
		}
		if(content.trim().length == 0)return;
		if(!msg_type){
			msg_type = MSG_TYPE_TEXT;
		}
		var main_content = "";
		switch(msg_type){
			case MSG_TYPE_TEXT:
				main_content = text_tpl["rightplain"].join('').replaceTpl({content:ToggleFace(content)});
				break;
			case MSG_TYPE_IMAGE:
				main_content = text_tpl["rightpicture"].join('').replaceTpl({content:content});
				break;
		}
		var item = $(chattpl.replaceTpl({main_content:main_content, opid:user}));
		$('.ChatContainer').before(item);
		$('.MainChatContainer').scrollTop($('.MainChatContainer').get(0).scrollHeight);
		$(item).find('.ico_loading').show();

		$.ajax({
			url:'/request/send',
			data:{
				openid:CurrentOpenid,
				msg_type:msg_type,
				message:content,
				source:CurrentSource,
				media_id:media_id
			},
			dataType:'json',
			type:'POST',
			success:function(data){
				if(data.status){
					$(item).find('.ico_loading').hide();
				}else{
					$(item).find('.web_wechat_message_fail').show();
					$(item).find('.web_wechat_message_fail').attr('title', data.msg);
				}	
			}
		});

	};

	$('.btn_send').click(function(){
		addChatItem();
	});

	$('#editArea').on('keyup', function(ev){
		if(ev.keyCode == 13 && ev.ctrlKey){
			addChatItem();
		}
	});


	var sort_user = function(a, b){
		return a.ts < b.ts;
	};


	var loadMyUser = function(){
		$.ajax({
			url:'/request/cc',
			data:{},
			dataType:'json',
			type:'POST',
			success:function(data){
				if(data.status){
					var wait = data.data.wait;
					data = data.data;
					if(wait > 0){
						window.parent.$('#newMsgTip').show();
						window.parent.$('#newWaitNum').text(wait);
					}
					if(data.data.length == 0)return;
					$('.useritem').remove();
					data.data = data.data.sort(sort_user);
					if(CurrentOpenid == ''){
						CurrentOpenid = data.data[0].openid;
						CurrentSource = data.data[0].source;
						if(data.data[0].headurl != ''){
							CurrentHeadurl = data.data[0].headurl;
						}
						$('.title_name').text(data.data[0].openid_name);
						loadHistory();
					}
					$.each(data.data, function(i, d){
						addUserItem(d.openid_name, d.msg, CurrentOpenid == d.openid ? true : false, d.number, d.openid, d.msgType, d.headurl, d.source);
						if(CurrentOpenid == d.openid && d.number > 0){
							getUnread();
						}
					});	
				}else{
					alert(data.msg);
				}
			}
		});
	};

	(function(){
		var cb = arguments.callee;
		loadMyUser();
		setTimeout(cb, 10000);
	})();

	var getUnread = function(isload){
		var openid = CurrentOpenid;
		$('.' + CurrentOpenid + '_unread_number').hide();
		$.ajax({
			url : '/request/fetch',
			data:{
				openid:CurrentOpenid
			},
			dataType:'json',
			type:'POST',
			success:function(data){
				if(data.status){
					if(isload)return;
					if(openid != CurrentOpenid)return;
					data = data.data.unread;
					if(data.length == 0)return;
					$.each(data, function(i, d){
						var in_tpl;
						switch(d.msgType){
							case MSG_TYPE_TEXT:
								d.content = ToggleFace(d.content);
								in_tpl = text_tpl['leftplain'];
								break;
							case MSG_TYPE_IMAGE:
								in_tpl = text_tpl['leftpicture'];
								break;
							case MSG_TYPE_AUDIO:
								in_tpl = text_tpl['leftaudio'];
								break;
						}
						var main_content = in_tpl.join('').replaceTpl(d);
						$('.ChatContainer').before(chatlefttpl.replaceTpl({main_content:main_content, headurl:CurrentHeadurl}));
						$('.MainChatContainer').scrollTop($('.MainChatContainer').get(0).scrollHeight);
					});

				}			
			}
		});

	};

	var loadHistory = function(){
		$.ajax({
			url : '/request/message/list',
			data:{
				openid:CurrentOpenid
			},
			dataType:'json',
			type:'POST',
			success:function(data){
				if(data.status){
					data = data.data;
					if(data.length == 0)return;
					$('.chat_list_item').remove();
					data = data.reverse();
					$.each(data, function(i, d){
						var tpl = chatlefttpl, in_tpl;
						switch(d.msgType){
							case MSG_TYPE_TEXT:
								d.content = ToggleFace(d.content);
								in_tpl = text_tpl['leftplain'];
								break;
							case MSG_TYPE_IMAGE:
								in_tpl = text_tpl['leftpicture'];
								break;
							case MSG_TYPE_AUDIO:
								in_tpl = text_tpl['leftaudio'];
								break;
						}

						if(d.opid !== ""){
							tpl = chattpl;

							switch(d.msgType){
								case MSG_TYPE_TEXT:
									d.content = ToggleFace(d.content);
									in_tpl = text_tpl['rightplain'];
									break;
								case MSG_TYPE_IMAGE:
									in_tpl = text_tpl['rightpicture'];
									break;
							}
						}
						var main_content = in_tpl.join('').replaceTpl(d);
						$('.ChatContainer').before(tpl.replaceTpl({main_content:main_content, opid:d.opid, headurl:CurrentHeadurl}));
						$('.MainChatContainer').scrollTop($('.MainChatContainer').get(0).scrollHeight);
					});

					getUnread("unload");
				}				
			}
		});

	};

	$(document.body).on('click', '.chat_item', function(){
		if($(this).hasClass('active'))return;
		$('.chat_item').removeClass('active');
		$(this).addClass('active');

		$(this).find('.unread_number').hide();

		var openid = $(this).attr('openid');
		var source = $(this).attr('source');
		var openid_name = $(this).attr('openid_name');
		var headurl = $(this).find('img').attr('src');
		CurrentOpenid = openid;
		CurrentSource = source;
		CurrentHeadurl = headurl;
		$('.title_name').text(openid_name);
		loadHistory();
	});

	window.callback = function(data){
		if(data.status){
			data = data.data;
			addChatItem(data.filepath, data.media_id, MSG_TYPE_IMAGE);
		}else{
			alert(data.msg);
		}
	}

	$('.web_wechat_face').click(function(){
		$('#mmpop_emoji_panel').toggle();
	});

	$('.qq_face').find('.face').click(function(){
		var val = $('#editArea').val();	
		$('#editArea').val(val + '[' + this.title + ']');
	});


	$(document.body).on('click', function(e){
		$('#contextMenu').hide();

		if(e.target != $('.web_wechat_face').get(0)){
			$('#mmpop_emoji_panel').hide();
		}
	});


	var clearScreen = function(openid){
		if(openid == CurrentOpenid){
			$('.chat_list_item').remove();
			CurrentOpenid = '';
			CurrentSource = '';
			$('.title_name').text('');
		}
		$('.useritem_' + openid).remove();
	};



})(jQuery, window)
