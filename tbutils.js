function initwrapper() {
(function (TBUtils) {

    // We need these before we can do anything.
    TBUtils.modhash = $("form.logout input[name=uh]").val();
    TBUtils.logged = (TBUtils.modhash !== undefined) ? $('span.user a:first').html() : '';
    TBUtils.post_site = $('.redditname:not(.pagename) a:first').html();  // This may need to be changed to regex, if this is unreliable.

    // validate post_site. TODO: something better than this.
    if (TBUtils.post_site == "subreddits you moderate" || TBUtils.post_site == "mod (filtered)") {
        TBUtils.post_site = "";
    }

    var CHROME = 'chrome', FIREFOX = 'firefox', OPERA = 'opera', SAFARI = 'safari', UNKOWN_BROWSER = 'unknown',
        ECHO = 'echo', SHORTNAME = 'TBUtils', SETTINGS_NAME = 'Utils';

    //Private variables
    var modMineURL = '/subreddits/mine/moderator.json?count=100',
        now = new Date().getTime(),

        shortLength = TBStorage.getSetting(SETTINGS_NAME, 'shortLength', 15),
        longLength = TBStorage.getSetting(SETTINGS_NAME, 'longLength', 45),

        lastgetLong = TBStorage.getCache(SETTINGS_NAME, 'lastGetLong', -1),
        lastgetShort = TBStorage.getCache(SETTINGS_NAME, 'lastGetShort', -1),
        cacheName = TBStorage.getCache(SETTINGS_NAME, 'cacheName', ''),
        seenNotes = TBStorage.getSetting(SETTINGS_NAME, 'seenNotes', []),
        lastVersion = TBStorage.getSetting(SETTINGS_NAME, 'lastVersion', 0),
        toolboxDevs = TBStorage.getSetting(SETTINGS_NAME, 'tbDevs', []),
        newLogin = (cacheName != TBUtils.logged),
        getnewLong = (((now - lastgetLong) / (60 * 1000) > longLength) || newLogin),
        getnewShort = (((now - lastgetShort) / (60 * 1000) > shortLength) || newLogin),
        betaRelease = true,  /// DO NOT FORGET TO SET FALSE BEFORE FINAL RELEASE! ///
        gettingModSubs = false,
        getModSubsCallbacks = [],

        randomQuotes = ["Dude, in like 24 months, I see you Skyping someone to watch them search someone's comments on reddit.",
            "Simple solution, don't use nightmode....",
            "Nightmode users are a buncha nerds.",
            "Oh, so that's where that code went, I thought i had lost it somehow.",
            "Are all close buttons pretty now?!?!?",
            "As a Business Analyst myself...",
            "TOOLBOX ISN'T YOUR PERSONAL TOOL!",
            "You are now an approvened submitter",
            "Translate creesch's Klingon settings to English.",
            "Cuz Uncle Jessy was hot and knew the Beach Boys",
            "Don't worry too much. There's always extra pieces.",
            "Make the check actually check.",
            "I dunno what this 'Safari' thing is.",
            "eeeeew... why is there PHP code in this room?",
            "nah there is an actual difference between stuff",
            "...have you paid money *out of your own pocket* to anyone to vet this product?",
            "first I want to make sure my thing actually does work sort of",
            "Don't let \"perfect\" get in the way of \"good.\"",
            "damnit creesch, put a spoiler tag, now the ending of toolbox is ruined for me",
            "It's not even kinda bad... It's strangely awful.",
            "Like a good neighbor, /u/andytuba is there",
            "toolbox is build on beer"],

        RandomFeedbackText = ["Please hold, your call is important to us.",
            "Remember, toolbox loves you.",
            "toolbox will be back later, gone fishing.",
            "toolbox is 'doing things', don't ask.",
            "Tuning probability drive parameters.",
            "Initiating data transfer: NSA_backdoor_package. ",
            "Please post puppy pictures, they are so fluffy!",
            "RES is visiting for a sleepover,  no time right now",
            "toolbox is on strike, we demand more karma!",
            "brb... kicking Gustavobc from #toolbox",
            "Requesting a new insurance quote from /u/andytuba"];


    // Public variables
    TBUtils.toolboxVersion = '3.3.0' + ((betaRelease) ? ' (beta)' : '');
    TBUtils.shortVersion = 330; //don't forget to change this one!  This is used for the 'new version' notification.
    TBUtils.releaseName = 'YO MAMA';
    TBUtils.configSchema = 1;
    TBUtils.notesSchema = 6;
    TBUtils.notesMinSchema = 3;
    TBUtils.notesDeprecatedSchema = 3;
    TBUtils.notesMaxSchema = 6;     // The non-default max version (to allow phase-in schema releases)
    TBUtils.NO_WIKI_PAGE = 'NO_WIKI_PAGE';
    TBUtils.WIKI_PAGE_UNKNOWN = 'WIKI_PAGE_UNKNOWN';
    TBUtils.isModmail = location.pathname.match(/(\/message\/(?:moderator)\/?)|(\/r\/.*?\/about\/message\/inbox\/?)/);
    TBUtils.isModmailUnread = location.pathname.match(/\/message\/(?:moderator\/unread)\/?/);
    TBUtils.isModpage = location.pathname.match(/\/about\/(?:reports|modqueue|spam|unmoderated|edited)\/?/);
    TBUtils.isEditUserPage = location.pathname.match(/\/about\/(?:contributors|moderator|banned)\/?/);
    TBUtils.isModFakereddit = location.pathname.match(/^\/r\/mod\b/) || location.pathname.match(/^\/me\/f\/mod\b/);
    TBUtils.isToolbarPage = location.pathname.match(/^\/tb\//);
    TBUtils.isUnreadPage = location.pathname.match(/\/message\/(?:unread)\/?/);
    TBUtils.isModLogPage = location.pathname.match(/\/about\/(?:log)\/?/);
    TBUtils.isModQueuePage = location.pathname.match(/\/about\/(?:modqueue)\/?/);
    TBUtils.isUnmoderatedPage = location.pathname.match(/\/about\/(?:unmoderated)\/?/);
    TBUtils.isCommentsPage = location.pathname.match(/\?*\/(?:comments)\/?/);
    TBUtils.isUserPage = location.pathname.match(/\/(?:user)\/?/);
    TBUtils.isNewPage = location.pathname.match(/\?*\/(?:new)\/?/);
    TBUtils.isMod = $('body.moderator').length;
    TBUtils.isExtension = true;
    TBUtils.RandomQuote = randomQuotes[Math.floor(Math.random() * randomQuotes.length)];
    TBUtils.RandomFeedback = RandomFeedbackText[Math.floor(Math.random() * RandomFeedbackText.length)];
    TBUtils.log = [];
    TBUtils.logModules = [];
    TBUtils.debugMode = TBStorage.getSetting(SETTINGS_NAME, 'debugMode', false);
    TBUtils.devMode = TBStorage.getSetting(SETTINGS_NAME, 'devMode', false);
    TBUtils.betaMode = TBStorage.getSetting(SETTINGS_NAME, 'betaMode', false);
    TBUtils.advancedMode = TBStorage.getSetting(SETTINGS_NAME, 'advancedMode', false);
    TBUtils.firstRun = false;
    TBUtils.tbDevs = toolboxDevs;
    TBUtils.betaRelease = betaRelease;

    // Stuff from TBStorage
    TBUtils.browser = TBStorage.browser;
    TBUtils.domain = TBStorage.domain;
    TBUtils.browsers = TBStorage.browsers;


    // Check our post site.  We might want to do some sort or regex fall back here, if it's needed.
    if (TBUtils.isModFakereddit || TBUtils.post_site === undefined || !TBUtils.post_site) {
        TBUtils.post_site = '';
    }


    // Do settings echo before anything else.  If it fails, exit toolbox.
    var ret = TBStorage.setSetting(SETTINGS_NAME, 'echoTest', ECHO);
    if (ret !== ECHO) {
        alert('toolbox can not save settings to localstorage\n\ntoolbox will now exit');
        return;
    }

    $('body').addClass('mod-toolbox');


    // Get cached info.
    TBUtils.noteCache = (getnewShort) ? {} : TBStorage.getCache(SETTINGS_NAME, 'noteCache', {});
    TBUtils.configCache = (getnewLong) ? {} : TBStorage.getCache(SETTINGS_NAME, 'configCache', {});
    TBUtils.noConfig = (getnewShort) ? [] : TBStorage.getCache(SETTINGS_NAME, 'noConfig', []);
    TBUtils.noNotes = (getnewShort) ? [] : TBStorage.getCache(SETTINGS_NAME, 'noNotes', []);
    TBUtils.mySubs = (getnewLong) ? [] : TBStorage.getCache(SETTINGS_NAME, 'moderatedSubs', []);
    TBUtils.mySubsData = (getnewLong) ? [] : TBStorage.getCache(SETTINGS_NAME, 'moderatedSubsData', []);

    if (TBUtils.debugMode) {
        var consoleText = 'toolbox version: ' + TBUtils.toolboxVersion +
            ', Browser: ' + TBUtils.browser +
            ', Extension: ' + TBUtils.isExtension +
            ', Beta features: ' + TBUtils.betaMode +
            '\n\n"' + TBUtils.RandomQuote+ '"\n';

        TBUtils.log.push(consoleText);
    }

    // Update cache vars as needed.
    if (newLogin) {
        $.log('Account changed', false, SHORTNAME);
        TBStorage.setCache(SETTINGS_NAME, 'cacheName', TBUtils.logged);
    }

    if (getnewLong) {
        $.log('Long cache expired', false, SHORTNAME);
        TBStorage.setCache(SETTINGS_NAME, 'lastGetLong', now);
    }

    if (getnewShort) {
        $.log('Short cache expired', false, SHORTNAME);
        TBStorage.setCache(SETTINGS_NAME, 'lastGetShort', now);
    }

    var pushedunread = TBStorage.getSetting('Notifier', 'unreadPushed', []);
    if (pushedunread.length > 250) {
        pushedunread.splice(150, (pushedunread.length - 150));
        TBStorage.setSetting('Notifier', 'unreadPushed', pushedunread);
    }

    var pusheditems = TBStorage.getSetting('Notifier', 'modqueuePushed', []);
    if (pusheditems.length > 250) {
        pusheditems.splice(150, (pusheditems.length - 150));
        TBStorage.setSetting('Notifier', 'modqueuePushed', pusheditems);
    }

    var repliedModmail = TBStorage.getSetting('ModMail', 'replied', []);
    if (repliedModmail.length > 250) {
        pusheditems.splice(150, (repliedModmail.length - 150));
        TBStorage.setSetting('ModMail', 'replied', repliedModmail);
    }

    if (seenNotes.length > 250) {
        $.log("clearing seen notes", false, SHORTNAME);
        seenNotes.splice(150, (seenNotes.length - 150));
        TBStorage.setSetting(SETTINGS_NAME, 'seenNotes', seenNotes);
    }

    if (toolboxDevs.length < 1) {
        TBUtils.tbDevs = getToolboxDevs();
    }


    // First run changes.
    if (TBUtils.shortVersion > lastVersion) {

        // These need to happen for every version change
        TBUtils.firstRun = true; // for use by other modules.
        TBStorage.setSetting(SETTINGS_NAME, 'lastVersion', TBUtils.shortVersion); //set last version to this version.
        TBUtils.tbDevs = getToolboxDevs();  //always repopulate tb devs for each version change

        //** This should be a per-release section of stuff we want to change in each update.  Like setting/converting data/etc.  It should always be removed before the next release. **//

        // Start: version changes.
        /* TBUtils.[get/set]Setting IS NOT DEFINDED YET!!!  Use TBStorage.[get/set]settings */

        // 3.3 version changes
        $.log('Running ' + TBUtils.toolboxVersion + ' changes', true, SHORTNAME);

        // No longer settings.
        localStorage.removeItem('Toolbox.ModMail.autoThread');
        localStorage.removeItem('Toolbox.ModMail.autoThreadOnLoad');

        // End: version changes.

        // These two should be left for every new release. If there is a new beta feature people want, it should be opt-in, not left to old settings.
        //TBStorage.setSetting('Notifier', 'lastSeenModmail', now); // don't spam 100 new mod mails on first install.
        //TBStorage.setSetting('Notifier', 'modmailCount', 0);
        TBStorage.setSetting(SETTINGS_NAME, 'debugMode', false);
        TBStorage.setSetting(SETTINGS_NAME, 'betaMode', false);
        TBUtils.debugMode = false;
        TBUtils.betaMode = false;
    }


    TBUtils.usernotes = {
        ver: TBUtils.notesSchema,
        users: [] //typeof userNotes
    };


    TBUtils.note = {
        note: '',
        time: '',
        mod: '',
        link: '',
        type: ''
    };


    TBUtils.warningType = ['gooduser', 'spamwatch', 'spamwarn', 'abusewarn', 'ban', 'permban', 'botban'];


    TBUtils.config = {
        ver: TBUtils.configSchema,
        domainTags: '',
        removalReasons: '',
        modMacros: ''
    };

    TBUtils.events = {
        TB_ABOUT_PAGE: "TB_ABOUT_PAGE",
        TB_APPROVE_THING: "TB_APPROVE_THING",
        TB_FLY_SNOO: 'TB_FLY_SNOO',
        TB_KILL_SNOO: 'TB_KILL_SNOO'
    };

    // Methods and stuff

    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        };
    }

    TBUtils.sendEvent = function (tbuEvent){
        $.log('Sending event: ' + tbuEvent, false, SHORTNAME);
        window.dispatchEvent( new CustomEvent(tbuEvent) );
    };

    TBUtils.catchEvent = function (tbuEvent, callback){
       if (!callback) return;

        window.addEventListener(tbuEvent, callback);
    };

    TBUtils.getTypeInfo = function (warningType) {
        var typeInfo = {
            name: '',
            color: '',
            text: ''
        };

        switch (String(warningType)) { //not sure why it gets passed as an array.
            case 'gooduser':
                typeInfo = {color: 'green', name: 'Contributor', text: 'Good Contributor'};
                break;
            case 'spamwatch':
                typeInfo = {color: 'fuchsia', name: 'Watching', text: 'Spam Watch'};
                break;
            case 'spamwarn':
                typeInfo = {color: 'purple', name: 'Warned', text: 'Spam Warning'};
                break;
            case 'abusewarn':
                typeInfo = {color: 'orange', name: 'Warned', text: 'Abuse Warning'};
                break;
            case 'ban':
                typeInfo = {color: 'red', name: 'Banned', text: 'Ban'};
                break;
            case 'permban':
                typeInfo = {color: 'darkred', name: 'Perma-banned', text: 'Permanent Ban'};
                break;
            case 'botban':
                typeInfo = {color: 'black', name: 'Bot Banned', text: 'Bot Ban'};
                break;
            default:
                typeInfo = {color: '', name: '', text: 'none'};
        }

        return typeInfo;
    };

	TBUtils.escapeHTML = function(html)
	{
		var entityMap = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': '&quot;',
			"'": '&#39;',
			"/": '&#x2F;'
		};

		return String(html).replace(/[&<>"'\/]/g, function (s) {
			return entityMap[s];
		});
	};

	TBUtils.unescapeHTML = function(html)
	{
		var entityMap = {
			"&amp;": "&",
			"&lt;": "<",
			"&gt;": ">",
			'&quot;': '"',
			'&#39;': "'",
			'&#x2F;' : "/"
		};

		return String(html).replace(/[&<>"'\/]/g, function (s) {
			return entityMap[s];
		});
	};

    TBUtils.getTime = function() {
        return new Date().getTime();
    };

    TBUtils.getRandomNumber = function(maxInt){
        return Math.floor((Math.random() * maxInt) + 1)
    };

    //
    TBUtils.minutesToMilliseconds = function (mins) {
        var oneMin = 60000,
            milliseconds = mins * 60 * 1000;

        // Never return less than one min.
        if (milliseconds < oneMin) {
            milliseconds = oneMin
        }

        return milliseconds;
    };

    TBUtils.daysToMilliseconds = function (days) {
        return days * 86400000;
    };

    TBUtils.millisecondsToDays = function (milliseconds) {
        return milliseconds / 86400000;
    };

    // convert unix epoch timestamps to ISO format
    TBUtils.timeConverterISO = function (UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var year = a.getFullYear();
        var month = ('0' + (a.getUTCMonth() + 1)).slice(-2);
        var date = ('0' + a.getUTCDate()).slice(-2);
        var hour = ('0' + a.getUTCHours()).slice(-2);
        var min = ('0' + a.getUTCMinutes()).slice(-2);
        var sec = ('0' + a.getUTCSeconds()).slice(-2);
        return year + '-' + month + '-' + date + 'T' + hour + ':' + min + ':' + sec + 'Z';
    };

	TBUtils.niceDateDiff = function(origdate, newdate) {
		// Enter the month, day, and year below you want to use as
		// the starting point for the date calculation
		if (!newdate) {
			newdate = new Date();
		}

		var amonth = origdate.getUTCMonth() + 1;
		var aday = origdate.getUTCDate();
		var ayear = origdate.getUTCFullYear();

		var tyear = newdate.getUTCFullYear();
		var tmonth = newdate.getUTCMonth() + 1;
		var tday = newdate.getUTCDate();

		var y = 1;
		var mm = 1;
		var d = 1;
		var a2 = 0;
		var a1 = 0;
		var f = 28;

		if (((tyear % 4 === 0) && (tyear % 100 !== 0)) || (tyear % 400 === 0)) {
			f = 29;
		}

		var m = [31, f, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

		var dyear = tyear - ayear;

		var dmonth = tmonth - amonth;
		if (dmonth < 0 && dyear > 0) {
			dmonth = dmonth + 12;
			dyear--;
		}

		var dday = tday - aday;
		if (dday < 0) {
			if (dmonth > 0) {
				var ma = amonth + tmonth;

				if (ma >= 12) {
					ma = ma - 12;
				}
				if (ma < 0) {
					ma = ma + 12;
				}
				dday = dday + m[ma];
				dmonth--;
				if (dmonth < 0) {
					dyear--;
					dmonth = dmonth + 12;
				}
			} else {
				dday = 0;
			}
		}

		var returnString = '';

		if (dyear === 0) {
			y = 0;
		}
		if (dmonth === 0) {
			mm = 0;
		}
		if (dday === 0) {
			d = 0;
		}
		if ((y === 1) && (mm === 1)) {
			a1 = 1;
		}
		if ((y === 1) && (d === 1)) {
			a1 = 1;
		}
		if ((mm === 1) && (d === 1)) {
			a2 = 1;
		}
		if (y === 1) {
			if (dyear === 1) {
				returnString += dyear + ' year';
			} else {
				returnString += dyear + ' years';
			}
		}
		if ((a1 === 1) && (a2 === 0)) {
			returnString += ' and ';
		}
		if ((a1 === 1) && (a2 === 1)) {
			returnString += ', ';
		}
		if (mm === 1) {
			if (dmonth === 1) {
				returnString += dmonth + ' month';
			} else {
				returnString += dmonth + ' months';
			}
		}
		if (a2 === 1) {
			returnString += ' and ';
		}
		if (d === 1) {
			if (dday === 1) {
				returnString += dday + ' day';
			} else {
				returnString += dday + ' days';
			}
		}
		if (returnString === '') {
			returnString = '0 days';
		}
		return returnString;
	};

    // convert unix epoch timestamps to readable format dd-mm-yyyy hh:mm:ss UTC
    TBUtils.timeConverterRead = function (UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var year = a.getFullYear();
        var month = ('0' + (a.getUTCMonth() + 1)).slice(-2);
        var date = ('0' + a.getUTCDate()).slice(-2);
        var hour = ('0' + a.getUTCHours()).slice(-2);
        var min = ('0' + a.getUTCMinutes()).slice(-2);
        var sec = ('0' + a.getUTCSeconds()).slice(-2);
        return date + '-' + month + '-' + year + ' ' + hour + ':' + min + ':' + sec + ' UTC';
    };

    // convert titles to a format usable in urls
    // from r2.lib.utils import title_to_url
    TBUtils.title_to_url = function (title) {
        var max_length = 50;

        title = title.replace(/\s+/g, "_");     //remove whitespace
        title = title.replace(/\W+/g, "");      //remove non-printables
        title = title.replace(/_+/g, "_");      //remove double underscores
        title = title.replace(/^_+|_+$/g, "");  //remove trailing underscores
        title = title.toLowerCase();            //lowercase the title

        if (title.length > max_length) {
            title = title.substr(0, max_length);
            title = title.replace(/_[^_]*$/g, "");
        }

        return title || "_";
    };

    // Easy way to use templates. Usage example:
    //    TBUtils.template('/r/{{subreddit}}/comments/{{link_id}}/{{title}}/', {
    //                'subreddit': 'toolbox',
    //                'title':  title_to_url('this is a title we pulled from a post),
    //                'link_id': '2kwx2o'
    //            });
    TBUtils.template = function (tpl, variables) {
        return tpl.replace(/{{([^}]+)}}/g, function (match, variable) {
            return variables[variable];
        });
    };


    TBUtils.alert = function (message, callback) {
        var $noteDiv = $('<div id="tb-notification-alert"><span>' + message + '</span></div>');
        $noteDiv.append('<img src="data:image/png;base64,' + TBui.iconClose + '" class="note-close" title="Close" />');
        $noteDiv.appendTo('body');

        $noteDiv.click(function (e) {
            $noteDiv.remove();
            if (e.target.className === 'note-close') {
                callback(false);
                return;
            }
            callback(true);
        });
    };


    TBUtils.showNote = function (note) {
        if (!note.id || !note.text) return;

        function show() {
            if ($.inArray(note.id, seenNotes) === -1) {
                //TBStorage.setSetting(SETTINGS_NAME, 'noteLastShown', now);

                TBUtils.alert(note.text, function (resp) {
                    seenNotes.push(note.id);
                    TBStorage.setSetting(SETTINGS_NAME, 'seenNotes', seenNotes);
                    if (note.link && note.link.match(/^(https?\:|\/)/i) && resp) window.open(note.link);
                });
            }
        }

        //platform check.
        switch (note.platform) {
            case 'firefox':
                if (TBUtils.browser == FIREFOX && TBUtils.isExtension) show();
                break;
            case 'chrome':
                if (TBUtils.browser == CHROME && TBUtils.isExtension) show();
                break;
            case 'opera':
                if (TBUtils.browser == OPERA && TBUtils.isExtension) show();
                break;
            case 'safari':
                if (TBUtils.browser == SAFARI && TBUtils.isExtension) show();
                break;
            case 'script':
                if (!TBUtils.isExtension) show();
                break;
            case 'all':
                show();
                break;
            default:
                show();
        }
    };


    TBUtils.notification = function (title, body, url, markreadid) {
        var timeout = 10000;

        var toolboxnotificationenabled = true;

        // check if notifications are enabled. When they are not we simply abort the function.
        if (toolboxnotificationenabled === false) {
            //console.log('notifications disabled, stopping function');
            return;
        }

        if (!('Notification' in window)) {
            // fallback on a javascript notification
            $.log('boring old rickety browser, falling back on jquery based notifications', false, SHORTNAME);
            body = body.replace(/(?:\r\n|\r|\n)/g, '<br />');
            $.sticky('<strong>' + title + '</strong><br><p><a href="' + url + '">' + body + '<a></p>', {'autoclose': timeout});

        } else if (Notification.permission === 'granted') {

            var notification = new Notification(title, {
                dir: "auto",
                body: body,
                icon: "data:image/png;base64," + TBui.logo64
            });
            setTimeout(function () {
                notification.close()
            }, timeout);

            notification.onclick = function () {
                // Open the page
                $.log('notification clicked', false, SHORTNAME);
                if (markreadid !== 'undefined') {
                    $.post('/api/read_message', {
                        id: markreadid,
                        uh: TBUtils.modhash,
                        api_type: 'json'
                    });
                }

                open(url);
                // Remove notification
                this.close();
            }

        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {

                // Whatever the user answers, we make sure we store the information
                if (!('permission' in Notification)) {
                    Notification.permission = permission;
                }

                // If the user is okay, let's create a notification
                if (permission === 'granted') {
                    var notification = new Notification(title, {
                        dir: "auto",
                        body: body,
                        icon: "data:image/png;base64," + TBui.logo64
                    });
                    setTimeout(function () {
                        notification.close()
                    }, timeout);

                    notification.onclick = function () {
                        // Open the page
                        $.log('notification clicked', false, SHORTNAME);
                        if (markreadid !== 'undefined') {
                            $.post('/api/read_message', {
                                id: markreadid,
                                uh: TBUtils.modhash,
                                api_type: 'json'
                            });
                        }
                        open(url);
                        // Remove notification
                        this.close();
                    }
                }
            });
        } else {
            // They have the option enabled, but won't grant permissions, so fall back.
            body = body.replace(/(?:\r\n|\r|\n)/g, '<br />');
            $.sticky('<strong>' + title + '</strong><br><p><a href="' + url + '">' + body + '<a></p>', {'autoclose': timeout});
        }
    };


    TBUtils.humaniseDays = function (diff) {
        var str = '';
        var values = {
            ' year': 365,
            ' month': 30,
            ' week': 7,
            ' day': 1
        };

        for (var x in values) {
            var amount = Math.floor(diff / values[x]);

            if (amount >= 1) {
                str += amount + x + (amount > 1 ? 's' : '') + ' ';
                diff -= amount * values[x];
            }
        }
        return str.slice(0, -1);
    };

    TBUtils.stringFormat = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };


    TBUtils.sortBy = function (arr, prop) {
        return arr.sort(function (a, b) {
            if (a[prop] < b[prop]) return 1;
            if (a[prop] > b[prop]) return -1;
            return 0;
        });
    };

    TBUtils.getHead = function (url, doneCallback) {
        $.ajax({
            type: 'HEAD',
            url: url
        })
            .done(function (data, status, jqxhr) {
                // data isn't needed; just the tip
                doneCallback(status, jqxhr);
            });
    };

    // Because normal .sort() is case sensitive.
    TBUtils.saneSort = function (arr) {
        return arr.sort(function (a, b) {
            if (a.toLowerCase() < b.toLowerCase()) return -1;
            if (a.toLowerCase() > b.toLowerCase()) return 1;
            return 0;
        });
    };


    TBUtils.saneSortAs = function (arr) {
        return arr.sort(function (a, b) {
            if (a.toLowerCase() > b.toLowerCase()) return -1;
            if (a.toLowerCase() < b.toLowerCase()) return 1;
            return 0;
        });
    };

    TBUtils.replaceAll = function (find, replace, str) {
        find = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        return str.replace(new RegExp(find, 'g'), replace);
    };

    TBUtils.cleanSubredditName = function (dirtySub) {
        dirtySub = dirtySub.replace('/r/', '').replace('/', '').replace('−', '').replace('+', '').trim();
        return dirtySub;
    };


    TBUtils.getModSubs = function (callback) {
        $.log('getting mod subs', false, SHORTNAME);
        // If it has been more than ten minutes, refresh mod cache.
        if (TBUtils.mySubs.length < 1 || TBUtils.mySubsData.length < 1) {
            // time to refresh
            if (gettingModSubs) {
                // we're already fetching a new list, so enqueue the callback
                $.log('Enqueueing getModSubs callback', false, SHORTNAME);
                getModSubsCallbacks.push(callback);
            } else {
                // start the process
                $.log('getting new subs.', false, SHORTNAME);

                gettingModSubs = true;
                TBUtils.mySubs = []; // reset
                TBUtils.mySubsData = [];
                getSubs(modMineURL);
            }
        } else {
            // run callback on cached sublist
            TBUtils.mySubs = TBUtils.saneSort(TBUtils.mySubs);
            TBUtils.mySubsData = TBUtils.sortBy(TBUtils.mySubsData, 'subscribers');
            // Go!
            callback();
        }

        function getSubs(URL) {
            $.getJSON(URL, function (json) {
                getSubsResult(json.data.children, json.data.after);
            });
        }

        // Callback because reddits/mod/mine is paginated.
        function getSubsResult(subs, after) {
            $(subs).each(function () {
                var sub = this.data.display_name.trim();
                if ($.inArray(sub, TBUtils.mySubs) === -1) {
                    TBUtils.mySubs.push(sub);
                }

                var isinthere = false;
                $(TBUtils.mySubsData).each(function () {
                    if (this.subreddit === sub) {
                        isinthere = true
                    }
                });

                if (!isinthere) {
                    var subredditData = {
                        "subreddit": sub,
                        "subscribers": this.data.subscribers,
                        "over18": this.data.over18,
                        "created_utc": this.data.created_utc,
                        "subreddit_type": this.data.subreddit_type,
                        "submission_type": this.data.submission_type
                    };

                    TBUtils.mySubsData.push(subredditData);
                }
            });

            if (after) {
                var URL = modMineURL + '&after=' + after;
                getSubs(URL);
            } else {
                TBUtils.mySubs = TBUtils.saneSort(TBUtils.mySubs);
                TBUtils.mySubsData = TBUtils.sortBy(TBUtils.mySubsData, 'subscribers');
                // Update the cache.
                TBStorage.setCache(SETTINGS_NAME, 'moderatedSubs', TBUtils.mySubs);
                TBStorage.setCache(SETTINGS_NAME, 'moderatedSubsData', TBUtils.mySubsData);

                callback();
                // no idea what the following shit is.
                // Go!
                while (getModSubsCallbacks.length > 0) {
                    // call them in the order they were added
                    $.log("calling callback " + getModSubsCallbacks[0].name, false, SHORTNAME);
                    getModSubsCallbacks[0]();
                    getModSubsCallbacks.splice(0, 1); // pop first element
                }
                // done
                gettingModSubs = false;
            }
        }
    };

    TBUtils.getHashParameter = function(ParameterKey)
    {
        var hash = window.location.hash.substring(1);
        var params = hash.split('&');
        for (var i = 0; i < params.length; i++)
        {
            var keyval = params[i].split('='),
                key = keyval[0].replace('?','');
            if (key == ParameterKey)
            {
                return keyval[1];
            }
        }
    };

    TBUtils.getThingInfo = function (sender, modCheck) {
        // If we were passed in a .thing, we may have to walk down the tree to
        // find the associated .entry
        var $sender = $(sender),
            $entry = $($sender.closest('.entry')[0] || $sender.find('.entry')[0] || $sender),
            $thing = $($sender.closest('.thing')[0] || $sender),
            user = $entry.find('.author:first').text() || $thing.find('.author:first').text(),
            subreddit = TBUtils.post_site || $entry.find('.subreddit:first').text() || $thing.find('.subreddit:first').text() || $entry.find('.tagline .head b > a[href^="/r/"]:not(.moderator)').text(),
            permalink = $entry.find('a.bylink').attr('href') || $entry.find('.buttons:first .first a').attr('href') || $thing.find('a.bylink').attr('href') || $thing.find('.buttons:first .first a').attr('href'),
            domain = ($entry.find('span.domain:first').text() || $thing.find('span.domain:first').text()).replace('(', '').replace(')', ''),
            id = $entry.attr('data-fullname') || $thing.attr('data-fullname') || $sender.closest('.usertext').find('input[name=thing_id]').val(),
            body = '> ' + ($entry.find('.usertext-body:first').text() || $thing.find('.usertext-body:first').text()).split('\n').join('\n> '),

        // These need some fall backs, but only removal reasons use them for now.
            title = $thing.find('a.title').length ? $thing.find('a.title').text() : '',
            kind = $thing.hasClass('link') ? 'submission' : 'comment',
            postlink = $thing.find('a.title').attr('href');

        // removed? spam or ham?
        var removal = ($entry.find('.flat-list.buttons li b:contains("removed by")').text() || '').match(/removed by (.+) \(((?:remove not |confirm )?spam)/) || [],
            banned_by = removal[1] || '',
            spam = removal[2] == 'spam' || removal[2] == 'confirm spam',
            ham = removal[2] == 'remove not spam';

        if (TBUtils.isEditUserPage && !user) {
            user = $sender.closest('.user').find('a:first').text() || $entry.closest('.user').find('a:first').text() || $thing.closest('.user').find('a:first').text();
        }


        // If we still don't have a sub, we're in mod mail, or PMs.
        if (TBUtils.isModmail || $sender.closest('.message-parent')[0] !== undefined) {
            // Change it to use the parent's title.
            title = $sender.find('.subject-text:first').text();

            subreddit = (subreddit) ? subreddit : ($entry.find('.head a:last').text() || $thing.find('.head a:last').text());

            //This is a weird palce to go about this, and the conditions are strange,
            //but if we're going to assume we're us, we better make damned well sure that is likely the case.
            // if ($entry.find('.remove-button').text() === '') {
            // The previous check would mistakenly catch removed modmail messages as the user's messages.
            // This check should be safe, since the only time we get no username in modmail is the user's own message. -dakta
            // The '.message-parent' check fixes reddit.com/message/messages/, which contains mod mail and PMs.

            // There are two users in the tagline, the first one is the user sending the message so we want to target that user.
            user = $entry.find('.sender a.author').text();

            // If there is only one use present and it says "to" it means that this is not the user sending the message.

            if ($entry.find('.sender a.author').length < 1 && $entry.find('.recipient a.author').length > 0) {
                user = TBUtils.logged;
            }

            if (user === '') {
                user = TBUtils.logged;

                if (!subreddit || subreddit.indexOf('/r/') < 1) {
                    // Find a better way, I double dog dare ya!
                    subreddit = $thing.closest('.message-parent').find('.correspondent.reddit.rounded a').text()
                }
            }


        }

        // A recent reddit change makes subreddit names sometimes start with "/r/".
        // Mod mail subreddit names additionally end with "/".
        // reddit pls, need consistency
        subreddit = TBUtils.cleanSubredditName(subreddit);

        // Not a mod, reset current sub.
        if (modCheck && $.inArray(subreddit, TBUtils.mySubs) === -1) {
            subreddit = '';
        }

        if (user == '[deleted]') {
            user = '';
        }

        var approved_text = $entry.find('.approval-checkmark').attr('title') || $thing.find('.approval-checkmark').attr('title') || '',
            approved_by = approved_text.match(/by\s(.+?)\s/) || '';

        var info = {
            subreddit: subreddit,
            user: user,
            author: user,
            permalink: permalink,
            url: permalink,
            domain: domain,
            id: id,
            body: body,
            approved_by: approved_by,
            title: title,
            kind: kind,
            postlink: postlink,
            link: postlink,
            banned_by: banned_by,
            spam: spam,
            ham: ham,
            mod: TBUtils.logged
        };
        //$.log(info, false, SHORTNAME);
        return info;
    };

    TBUtils.replaceTokens = function (info, content) {
        $.log(info, false, SHORTNAME);
        for (var i in info) {
            var pattern = new RegExp('{' + i + '}', 'mig');
            content = content.replace(pattern, info[i]);
        }

        return content;
    };


    // Prevent page lock while parsing things.  (stolen from RES)
    TBUtils.forEachChunked = function (array, chunkSize, delay, call, complete, start) {
        if (array === null) finish();
        if (chunkSize === null || chunkSize < 1) finish();
        if (delay === null || delay < 0) finish();
        if (call === null) finish();
        var counter = 0;
        //var length = array.length;

        function doChunk() {
            if (counter == 0 && start) {
                start();
            }

            for (var end = Math.min(array.length, counter + chunkSize); counter < end; counter++) {
                var ret = call(array[counter], counter, array);
                if (ret === false) window.setTimeout(finish, delay);
            }
            if (counter < array.length) {
                window.setTimeout(doChunk, delay);
            } else {
                window.setTimeout(finish, delay);
            }
        }

        window.setTimeout(doChunk, delay);

        function finish() {
            return complete ? complete() : false;
        }
    };


    // Chunking abused for ratelimiting
    TBUtils.forEachChunkedRateLimit = function (array, chunkSize, call, complete, start) {
        if (array === null) finish();
        if (chunkSize === null || chunkSize < 1) finish();
        if (call === null) finish();

        var length = array.length,
            counter = 0,
            delay = 100,
            limit = (length > chunkSize) ? 20 : 0;


        if (length < chunkSize) {
            chunkSize = length;
        }

        function doChunk() {
            if (counter == 0 && start) {
                start();
            }

            for (var end = Math.min(array.length, counter + chunkSize); counter < end; counter++) {
                var ret = call(array[counter], counter, array);
                if (ret === false) window.setTimeout(finish, delay);
            }
            if (counter < array.length) {
                window.setTimeout(getRatelimit, delay);
            } else {
                window.setTimeout(finish, delay);
            }
        }

        function getRatelimit() {
            //return doChunk();
            TBUtils.getHead('/r/toolbox/wiki/ratelimit.json',
                function (status, jqxhr) {
                    var $body = $('body'),
                        ratelimitRemaining = jqxhr.getResponseHeader('x-ratelimit-remaining'),
                        ratelimitReset = jqxhr.getResponseHeader('x-ratelimit-reset');
                    $.log('ratelimitRemaining: ' + ratelimitRemaining + ' ratelimitReset: ' + (ratelimitReset / 60), false, SHORTNAME);

                    if (!$body.find('#ratelimit-counter').length) {
                        $('div[role="main"].content').append('<span id="ratelimit-counter"></span>');
                    }

                    if (chunkSize + limit > parseInt(ratelimitRemaining)) {
                        $body.find('#ratelimit-counter').show();
                        var count = parseInt(ratelimitReset),
                            counter = 0;

                        function timer() {
                            count = count - 1;
                            if (count <= 0) {
                                clearInterval(counter);
                                $body.find('#ratelimit-counter').empty();
                                $body.find('#ratelimit-counter').hide();
                                doChunk();
                                return;
                            }

                            var minutes = Math.floor(count / 60);
                            var seconds = count - minutes * 60;

                            $body.find('#ratelimit-counter').html('<b>Oh dear, it seems we have hit a limit, waiting for ' + minutes + ' minutes and ' + seconds + ' seconds before resuming operations.</b>\
                    <br><br>\
                    <span class="rate-limit-explain"><b>tl;dr</b> <br> Reddit\'s current ratelimit allows for <i>' + ratelimitRemaining + ' requests</i>. We are currently trying to process <i>' + parseInt(chunkSize) + ' items</i>. Together with toolbox requests in the background that is cutting it a little bit too close. Luckily for us reddit tells us when the ratelimit will be reset, that is the timer you see now.</span>\
                    ');
                        }

                        counter = setInterval(timer, 1000);

                    } else {
                        doChunk();
                    }
                });
        }

        getRatelimit();

        function finish() {
            return complete ? complete() : false;
        }
    };



    // Reddit API stuff
    TBUtils.getRatelimit = function getRatelimit(callback) {
        TBUtils.getHead('/r/toolbox/wiki/ratelimit.json',
            function (status, jqxhr) {
            var ratelimitRemaining = jqxhr.getResponseHeader('x-ratelimit-remaining'),
                ratelimitReset = jqxhr.getResponseHeader('x-ratelimit-reset');
            $.log('ratelimitRemaining: ' + ratelimitRemaining + ' ratelimitReset: ' + (ratelimitReset / 60), false, SHORTNAME);

            if (typeof callback !== "undefined") {
                callback({
                    'ratelimitRemaining': ratelimitRemaining,
                    'ratelimitReset': ratelimitReset
                });
            }
        });
    };

    TBUtils.postToWiki = function postToWiki(page, subreddit, data, reason, isJSON, updateAM, callback) {
        if (reason) {
            reason = '"' + reason + '" via toolbox';
        } else {
            reason = 'updated via toolbox';
        }

        if (isJSON) {
            // Not indenting saves precious bytes.
            //data = JSON.stringify(data, undefined, TBUtils.debugMode ? 2 : undefined);
            data = JSON.stringify(data);
        }

        $.log("Posting /r/" + subreddit + "/api/wiki/edit/" + page, false, SHORTNAME);


        // If we update automoderator we want to replace any tabs with four spaces.
        if (updateAM) {
            data = data.replace(/\t/g, "    ");
        }

        $.post('/r/' + subreddit + '/api/wiki/edit', {
            content: data,
            page: page,
            reason: reason,
            uh: TBUtils.modhash
        })

            .error(function postToWiki_error(err) {
                $.log(err.responseText, false, SHORTNAME);
                callback(false, err);
            })

            .success(function () {
                // Callback regardless of what happens next.  We wrote to the page.
                callback(true);

                setTimeout(function () {

                    // Set page access to 'mod only'.
                    $.post('/r/' + subreddit + '/wiki/settings/', {
                        page: page,
                        listed: true, //hrm, may need to make this a config setting.
                        permlevel: 2,
                        uh: TBUtils.modhash
                    })

                        // Super extra double-secret secure, just to be safe.
                        .error(function (err) {
                            alert('error setting wiki page to mod only access');
                            window.location = '/r/' + subreddit + '/wiki/settings/' + page;
                        });

                }, 500);
            });
    };


    // reddit HTML encodes all of their JSON responses, we need to HTMLdecode
    // them before parsing.
    TBUtils.unescapeJSON = function (val) {
        if (typeof(val) == "string") {
            val = val.replace(/&quot;/g, '"')
                .replace(/&gt;/g, ">").replace(/&lt;/g, "<")
                .replace(/&amp;/g, "&");
        }
        return val;
    };


    TBUtils.readFromWiki = function (subreddit, page, isJSON, callback) {
        // We need to demangle the JSON ourselves, so we have to go about it this way :(
        $.ajax('/r/' + subreddit + '/wiki/' + page + '.json', {
            dataType: "json",
            dataFilter: function (data, type) {
                //TODO: right now a lot of functions implicitly rely on reddit
                //returning escaped JSON to operate safely. add this back in once
                //everything's been audited.

                //return TBUtils.unescapeJSON(data);
                return data;
            }
        })
            .success(function (json) {
                var wikiData = json.data.content_md;

                if (!wikiData) {
                    callback(TBUtils.NO_WIKI_PAGE);
                    return;
                }

                if (isJSON) {
                    var parsedWikiData;
                    try {
                        parsedWikiData = JSON.parse(wikiData);
                    }
                    catch (err) {
                        // we should really have a INVAILD_DATA error for this.
                        $.log(err, false, SHORTNAME);
                        callback(TBUtils.NO_WIKI_PAGE);
                    }

                    // Moved out of the try so random exceptions don't erase the entire wiki page
                    if (parsedWikiData) {
                        callback(parsedWikiData);
                    } else {
                        callback(TBUtils.NO_WIKI_PAGE);
                    }

                    return;
                }

                // We have valid data, but it's not JSON.
                callback(wikiData);

            })
            .error(function (jqXHR, textStatus, e) {
                $.log('Wiki error (' + subreddit + '/' + page + '): ' + e, false, SHORTNAME);
                if (jqXHR.responseText === undefined) {
                    callback(TBUtils.WIKI_PAGE_UNKNOWN);
                    return;
                }

                var reason = JSON.parse(jqXHR.responseText).reason || '';
                if (reason == 'PAGE_NOT_CREATED' || reason == 'WIKI_DISABLED') {
                    callback(TBUtils.NO_WIKI_PAGE);
                } else {
                    // we don't know why it failed, we should not try to write to it.
                    callback(TBUtils.WIKI_PAGE_UNKNOWN);
                }
            });
    };


    TBUtils.redditLogin = function (uname, pass, remeber, callback) {
        $.post('/api/login', {
            api_type: 'json',
            passwd: pass,
            user: uname,
            rem: remeber
        })
            .success(function () {
                if (typeof callback !== "undefined")
                    callback(true);
            })
            .error(function (error) {
                $.log(error, false, SHORTNAME);
                if (typeof callback !== "undefined")
                    callback(false, error);
            });
    };


    TBUtils.getBanState = function (subreddit, user, callback) {
        $.get("/r/" + subreddit + "/about/banned/.json", {user: user}, function (data) {
            var banned = data.data.children;

            // If it's over or under exactly one item they are not banned or that is not their full name.
            if (banned.length !== 1) {
                return callback(false);
            }

            callback(true, banned[0].note, banned[0].date, banned[0].name);
        });
    };


    TBUtils.flairPost = function (postLink, subreddit, text, cssClass, callback) {
        $.post('/api/flair', {
            api_type: 'json',
            link: postLink,
            text: text,
            css_class: cssClass,
            r: subreddit,
            uh: TBUtils.modhash
        })
            .success(function () {
                if (typeof callback !== "undefined")
                    callback(true);
            })
            .error(function (error) {
                if (typeof callback !== "undefined")
                    callback(false, error);
            });
    };

    TBUtils.flairUser = function (user, subreddit, text, cssClass, callback) {
        $.post('/api/flair', {
            api_type: 'json',
            name: user,
            r: subreddit,
            text: text,
            css_class: cssClass,
            uh: TBUtils.modhash
        })
            .success(function () {
                if (typeof callback !== "undefined")
                    callback(true);
            })
            .error(function (error) {
                if (typeof callback !== "undefined")
                    callback(false, error);
            });
    };

    TBUtils.friendUser = function (user, action, subreddit, banReason, banMessage, banDuration, callback) {
        $.post('/api/friend', {
            api_type: 'json',
            uh: TBUtils.modhash,
            type: action,
            name: user,
            r: subreddit,
            note: banReason,
            ban_message: banMessage,
            duration: banDuration
        })
            .success(function (response) {
                if (typeof callback !== "undefined")
                    callback(true, response);
            })
            .error(function (error) {
                if (typeof callback !== "undefined")
                    callback(false, error);
            });
    };

    TBUtils.unfriendUser = function (user, action, subreddit, callback) {
        $.post('/api/unfriend', {
            api_type: 'json',
            uh: TBUtils.modhash,
            type: action,
            name: user,
            r: subreddit
        })
            .success(function (response) {
                if (typeof callback !== "undefined")
                    callback(true, response);
            })
            .error(function (error) {
                if (typeof callback !== "undefined")
                    callback(false, error);
            });
    };

    TBUtils.distinguishThing = function (id, callback) {
        $.post('/api/distinguish/yes', {
            id: id,
            uh: TBUtils.modhash
        })
            .success(function () {
                if (typeof callback !== "undefined")
                    callback(true);
            })
            .error(function (error) {
                if (typeof callback !== "undefined")
                    callback(false, error);
            });
    };


    TBUtils.approveThing = function (id, callback) {
        $.post('/api/approve', {
            id: id,
            uh: TBUtils.modhash
        })
            .success(function () {
                if (typeof callback !== "undefined")
                    callback(true);
            })
            .error(function (error) {
                if (typeof callback !== "undefined")
                    callback(false, error);
            });
    };

    TBUtils.removeThing = function (id, spam, callback) {
        $.post('/api/remove', {
            uh: TBUtils.modhash,
            id: id,
            spam: spam
        })
            .success(function () {
                if (typeof callback !== "undefined")
                    callback(true);
            })
            .error(function (error) {
                if (typeof callback !== "undefined")
                    callback(false, error);
            });
    };

    TBUtils.postComment = function (parent, text, callback) {
        $.post('/api/comment', {
            parent: parent,
            uh: TBUtils.modhash,
            text: text,
            api_type: 'json'
        })
            .success(function (response) {
                if (response.json.hasOwnProperty("errors") && response.json.errors.length > 0) {
                    $.log("Failed to post comment to on " + parent, false, SHORTNAME);
                    $.log(response.json.errors, false, SHORTNAME);
                    if (typeof callback !== "undefined")
                        callback(false, response.json.errors);
                    return;
                }

                $.log("Successfully posted comment on " + parent, false, SHORTNAME);
                if (typeof callback !== "undefined")
                    callback(true, response);
            })
            .error(function (error) {
                $.log("Failed to post link to on" + parent, false, SHORTNAME);
                $.log(error, false, SHORTNAME);
                if (typeof callback !== "undefined")
                    callback(false, error);
            });
    };

    TBUtils.postLink = function (link, title, subreddit, callback) {
        $.post('/api/submit', {
            kind: 'link',
            resubmit: 'true',
            url: link,
            uh: TBUtils.modhash,
            title: title,
            sr: subreddit,
            sendreplies: 'true', //this is the default on reddit.com, so it should be our default.
            api_type: 'json'
        })
            .success(function (response) {
                if (response.json.hasOwnProperty("errors") && response.json.errors.length > 0) {
                    $.log("Failed to post link to /r/" + subreddit, false, SHORTNAME);
                    $.log(response.json.errors, false, SHORTNAME);
                    if (typeof callback !== "undefined")
                        callback(false, response.json.errors);
                    return;
                }

                $.log("Successfully posted link to /r/" + subreddit, false, SHORTNAME);
                if (typeof callback !== "undefined")
                    callback(true, response);
            })
            .error(function (error) {
                $.log("Failed to post link to /r/" + subreddit, false, SHORTNAME);
                $.log(error, false, SHORTNAME);
                if (typeof callback !== "undefined")
                    callback(false, error);
            });
    };

    TBUtils.sendMessage = function (user, subject, message, subreddit, callback) {
        $.post('/api/compose', {
            from_sr: subreddit,
            subject: subject,
            text: message,
            to: user,
            uh: TBUtils.modhash,
            api_type: 'json'
        })
            .success(function (response) {
                if (response.json.hasOwnProperty("errors") && response.json.errors.length > 0) {
                    $.log("Failed to send link to /u/" + user, false, SHORTNAME);
                    $.log(response.json.errors, false, SHORTNAME);
                    if (typeof callback !== "undefined")
                        callback(false, response.json.errors);
                    return;
                }

                $.log("Successfully send link to /u/" + user, false, SHORTNAME);
                if (typeof callback !== "undefined")
                    callback(true, response);
            })
            .error(function (error) {
                $.log("Failed to send link to /u/" + user, false, SHORTNAME);
                $.log(error, false, SHORTNAME);
                if (typeof callback !== "undefined")
                    callback(false, error);
            });
    };

    TBUtils.sendPM = function (to, subject, message, callback) {
        $.post('/api/compose', {
            to: to,
            uh: TBUtils.modhash,
            subject: subject,
            text: message
        })
            .success(function () {
                if (typeof callback !== "undefined")
                    callback(true);
            })
            .error(function (error) {
                if (typeof callback !== "undefined")
                    callback(false, error.responseText);
            });
    };

    TBUtils.markMessageRead = function (id, callback) {
        $.post('/api/read_message', {
            api_type: 'json',
            id: id,
            uh: TBUtils.modhash
        });
    };

    TBUtils.aboutUser = function (user, callback) {
        $.get('/user/' + user + '/about.json', {
            uh: TBUtils.modhash
        })
            .success(function (response) {
                if (typeof callback !== "undefined")
                    callback(true, response);
            })
            .error(function (error) {
                if (typeof callback !== "undefined")
                    callback(false, error.responseText);
            });
    };

    // Import export methods
    TBUtils.exportSettings = function (subreddit, callback) {
        var settingsObject = {};
        $(TBStorage.settings).each(function () {
            if (this == 'Storage.settings') return; // don't backup the setting registry.

            var key = this.split("."),
                setting = TBStorage.getSetting(key[0], key[1], null);

            if (setting !== null && setting !== undefined) { // DO NOT, EVER save null (or undefined, but we shouldn't ever get that)
                settingsObject[this] = setting;
            }
        });

        TBUtils.postToWiki('tbsettings', subreddit, settingsObject, 'exportSettings', true, false, function () {
            callback();
        });
    };


    TBUtils.importSettings = function (subreddit, callback) {
        TBUtils.readFromWiki(subreddit, 'tbsettings', true, function (resp) {
            if (!resp || resp === TBUtils.WIKI_PAGE_UNKNOWN || resp === TBUtils.NO_WIKI_PAGE) {
                $.log("Error loading wiki page", false, SHORTNAME);
                return;
            }

            if (TBUtils.domain != 'www') {
                TBui.textFeedback("Cannot import from " + TBUtils.domain + ".reddit.com.");
                $.log("Cannot import from " + TBUtils.domain + ".reddit.com.", false, SHORTNAME);
                return;
            }

            if (resp['Utils.lastversion'] < 300) {
                TBui.textFeedback("Cannot import from a toolbox version under 3.0");
                $.log("Cannot import from a toolbox version under 3.0", false, SHORTNAME);
                return;
            }

            $.each(resp, function (fullKey, value) {
                var key = fullKey.split(".");

                TBStorage.setSetting(key[0], key[1], value);
            });

            callback();
        });
    };


    // Utility methods
    TBUtils.removeQuotes = function (string) {
        return string.replace(/['"]/g, '');
    };

    TBUtils.stringToColor = function (str) {
        // str to hash
        for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));

        // int/hash to hex
        for (var i = 0, color = "#"; i < 3; color += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));

        return color;
    };


    // Added back for MMP's live mod mail.
    TBUtils.compressHTML = function (src) {
        return src.replace(/(\n+|\s+)?&lt;/g, '<').replace(/&gt;(\n+|\s+)?/g, '>').replace(/&amp;/g, '&').replace(/\n/g, '').replace(/child" >  False/, 'child">');
    };


    TBUtils.addToSiteTable = function (URL, callback) {
        if (!URL || !callback) callback(null);

        $.get(URL, function (resp) {
            if (!resp) callback(null);

            resp = resp.replace(/<script(.|\s)*?\/script>/g, '');
            var $sitetable = $(resp).find('#siteTable');
            $sitetable.find('.nextprev').remove();

            if ($sitetable) {
                callback($sitetable);
            } else {
                callback(null);
            }

        });
    };


    // easy way to simulate the php html encode and decode functions
    TBUtils.htmlEncode = function (value) {
        //create a in-memory div, set it's inner text(which jQuery automatically encodes)
        //then grab the encoded contents back out.  The div never exists on the page.
        return $('<div/>').text(value).html();
    };

    TBUtils.htmlDecode = function (value) {
        return $('<div/>').html(value).text();
    };


    TBUtils.zlibInflate = function (stringThing) {
        // Expand base64
        stringThing = atob(stringThing);
        // zlib time!
        var inflate = new pako.Inflate({to:'string'});
        inflate.push(stringThing);
        return inflate.result;
    };

    TBUtils.zlibDeflate = function (objThing) {
        // zlib time!
        var deflate = new pako.Deflate({to:'string'});
        deflate.push(objThing, true);
        objThing = deflate.result;
        // Collapse to base64
        return btoa(objThing);
    };


    TBUtils.clearCache = function () {
        $.log('TBUtils.clearCache()', false, SHORTNAME);

        TBUtils.noteCache = {};
        TBUtils.configCache = {};
        TBUtils.noConfig = [];
        TBUtils.noNotes = [];
        TBUtils.mySubs = [];
        TBUtils.mySubsData = [];

        TBStorage.clearCache();
    };


    TBUtils.getReasonsFromCSS = function (sub, callback) {

        // If not, build a new one, getting the XML from the stylesheet
        $.get('/r/' + sub + '/about/stylesheet.json').success(function (response) {
            if (!response.data) {
                callback(false);
                return;
            }

            // See if this subreddit is configured for leaving reasons using <removalreasons2>
            var match = response.data.stylesheet.replace(/\n+|\s+/g, ' ')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .match(/<removereasons2>.+<\/removereasons2>/i);

            // Try falling back to <removalreasons>
            if (!match) {
                match = response.data.stylesheet.replace(/\n+|\s+/g, ' ')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .match(/<removereasons>.+<\/removereasons>/i);
            }

            // Neither can be found.
            if (!match) {
                callback(false);
                return;
            }

            // Create valid XML from parsed string and convert it to a JSON object.
            var XML = $(match[0]);
            var reasons = [];

            XML.find('reason').each(function () {
                var reason = {
                    text: escape(this.innerHTML)
                };
                reasons.push(reason);
            });

            var oldReasons = {
                pmsubject: XML.find('pmsubject').text() || '',
                logreason: XML.find('logreason').text() || '',
                header: escape(XML.find('header').text() || ''),
                footer: escape(XML.find('footer').text() || ''),
                logsub: XML.find('logsub').text() || '',
                logtitle: XML.find('logtitle').text() || '',
                bantitle: XML.find('bantitle').text() || '',
                getfrom: XML.find('getfrom').text() || '',
                reasons: reasons
            };

            callback(oldReasons);
        }).error(function () {
            callback(false);
        });
    };

    // private functions
    function getToolboxDevs() {
        //TODO: actually pull these from /r/toolbox/about/moderators.json
        var devs = ['agentlame', 'creesch', 'LowSociety ', 'TheEnigmaBlade', 'dakta', 'largenocream', 'psdtwk', 'noeatnosleep', 'Garethp'];
        TBStorage.setSetting(SETTINGS_NAME, 'tbDevs', devs);
        return devs;
    }


    // NER, load more comments, and mod frame support.
    $('div.content').on('DOMNodeInserted', function (e) {
        var $target = $(e.target), $parentNode = $(e.target.parentNode);
        if (!($target.hasClass("sitetable") && ($target.hasClass("listing") || $target.hasClass("linklisting") ||
            $target.hasClass("modactionlisting"))) && !$parentNode.hasClass('morecomments') && !$target.hasClass('flowwit')) return;

        $.log('TBNewThings firing from: ' + $target.attr('class'), false, SHORTNAME);

        // Wait a sec for stuff to load.
        setTimeout(function () {
            var event = new CustomEvent("TBNewThings");
            window.dispatchEvent(event);
        }, 1000);
    });

    // NER support. todo: finish this.
    //window.addEventListener("neverEndingLoad", function () {
    //    $.log('NER! NER! NER! NER!');
    //});


    window.onbeforeunload = function () {
        // TBUI now handles the long load array.
        if (TBui.longLoadArray.length > 0) {
            return 'toolbox is still busy!';
        }


        // Cache data.
        TBStorage.setCache(SETTINGS_NAME, 'configCache', TBUtils.configCache);
        TBStorage.setCache(SETTINGS_NAME, 'noteCache', TBUtils.noteCache);
        TBStorage.setCache(SETTINGS_NAME, 'noConfig', TBUtils.noConfig);
        TBStorage.setCache(SETTINGS_NAME, 'noNotes', TBUtils.noNotes);
        TBStorage.setCache(SETTINGS_NAME, 'moderatedSubs', TBUtils.mySubs);
        TBStorage.setCache(SETTINGS_NAME, 'moderatedSubsData', TBUtils.mySubsData);

        // Just in case.
        TBStorage.unloading();
    };


    // get toolbox news
    (function getNotes() {
        TBUtils.readFromWiki('toolbox', 'tbnotes', true, function (resp) {
            if (!resp || resp === TBUtils.WIKI_PAGE_UNKNOWN || resp === TBUtils.NO_WIKI_PAGE || resp.length < 1) return;

            // Custom FF nag for updates.
            if (resp.ffVersion > TBUtils.shortVersion && TBUtils.browser == FIREFOX && TBUtils.isExtension) {
                TBUtils.alert("There is a new version of toolbox for Firefox!  Click here to update.", function (clicked) {
                    if (clicked) window.open('http://creesch.github.io/reddit-moderator-toolbox/downloads/reddit_mod_tb_' + resp.ffVersion + '.xpi');
                });
                return; //don't spam the user with notes until they have the current version.
            }

            // Custom Safari nag for updates.
            if (resp.safariVersion > TBUtils.shortVersion && TBUtils.browser == SAFARI && TBUtils.isExtension) {
                TBUtils.alert("There is a new version of toolbox for Safari!  Click here to update.", function (clicked) {
                    if (clicked) window.open('http://creesch.github.io/reddit-moderator-toolbox/downloads/reddit_mod_tb_' + resp.safariVersion + '.safariextz');
                });
                return; //don't spam the user with notes until they have the current version.
            }

            if (TBUtils.debugMode && resp.devVersion > TBUtils.shortVersion && TBUtils.isExtension) {
                TBUtils.alert("There is a new development version of toolbox!  Click here to update.", function (clicked) {
                    if (clicked) window.open("https://github.com/creesch/reddit-moderator-toolbox");
                });
            }

            $(resp.notes).each(function () {
                TBUtils.showNote(this);
            });
        });

        if (betaRelease) {
            TBUtils.readFromWiki('tb_beta', 'tbnotes', true, function (resp) {
                if (!resp || resp === TBUtils.WIKI_PAGE_UNKNOWN || resp === TBUtils.NO_WIKI_PAGE || resp.length < 1) return;
                $(resp.notes).each(function () {
                    TBUtils.showNote(this);
                });
            });
        }

        //check dev sub, if debugMode
        if (TBUtils.debugMode) {
            TBUtils.readFromWiki('tb_dev', 'tbnotes', true, function (resp) {
                if (!resp || resp === TBUtils.WIKI_PAGE_UNKNOWN || resp === TBUtils.NO_WIKI_PAGE || resp.length < 1) {
                    TBUtils.devMode = false;
                    TBUtils.devModeLock = true;
                    return;
                }

                $(resp.notes).each(function () {
                    TBUtils.showNote(this);
                });
            });
        }
    })();

    // get rate limit
    if (TBUtils.debugMode) {
        (function getRateLimit() {
            TBUtils.getRatelimit();
        })();
    }

}(TBUtils = window.TBUtils || {}));
}

(function () {
    // wait for storage
    window.addEventListener("TBStorageLoaded", function () {
        initwrapper();

        var event = new CustomEvent("TBUtilsLoaded");
        window.dispatchEvent(event);
    });
})();
