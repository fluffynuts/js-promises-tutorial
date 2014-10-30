(function() {
        function convertCodeBlocks() {
            var idx = 0;
            $('pre').each(function() {
                $(this).addClass('prettyprint');
                $(this).addClass('linenums');
                if ($(this).attr('data-no-run') === "true") {
                  return;
                }
                var scriptText = $(this).text();
                var scriptBlock = $('<scr' + 'ipt></scr' + 'ipt>');
                scriptBlock.attr('type', 'text/javascript');
                scriptText = 'function auto_' + idx + '() {\ntry { \ntry { clearLogs(); } catch (e) {console.log(e);}\n' + scriptText + '\n} catch (e) { log(\'Uncaught exception: \' + e); }}';
                scriptBlock.text(scriptText);
                $(this).after(scriptBlock);
                if ($(this).attr("data-auto-run") === "true") {
                    eval('auto_' + idx + '();');
                    return;
                }
                var p = $('<p></p>');
                p.css('text-align', 'right');
                var runButton = $('<button></button>');
                runButton.text('Run it');
                p.append(runButton);
                var toRun = 'auto_' + idx + '();';
                runButton.on('click', function() {
                    eval(toRun);
                });
                $(this).after(p);
                idx++;
            });
            }
            $(document).ready(function() {
                convertCodeBlocks();
                prettyPrint();
                $(document).trigger('magic-complete');
            });
            function zeroPad(str, places) {
              str = str + "";
              places = places || 2;
              while (str.length < places) {
                str = "0" + str;
              }
              return str;
            }
            function timestamp() {
              var d = new Date();
              return zeroPad(d.getHours()) + ":" + zeroPad(d.getMinutes()) + ":" + zeroPad(d.getSeconds()) + "." + zeroPad(d.getMilliseconds(), 3);
            }
            function ibdiv() {
              var result = $("<div></div>");
              result.css("display", "inline-block");
              return result;
            }
            window.log = function(str) { 
              var fakeConsole = $("div#console");
              var consoleHeight = "250px";
              if (fakeConsole.length === 0) {
                var wrapper = $("<div></div>");
                var header = $("<div></div>");
                header.text("[Console output]");
                header.css({
                  background: "#444",
                  height: "25px;"
                });
                wrapper.append(header);
                wrapper.attr("id", "consoleWrapper");
                wrapper.css({
                  width: "99%",
                  height: consoleHeight,
                  backgroundColor: "#111",
                  color: "#eee",
                  overflow: "clip",
                  bottom: "0px",
                  position: "fixed",
                  zIndex: "9999",
                  borderTop: "5px solid white",
                });
                fakeConsole = $("<div></div>");
                fakeConsole.attr("id", "console");
                fakeConsole.css({
                  overflow: "scroll",
                  height: "225px"
                });
                wrapper.append(fakeConsole);
                $("body").append(wrapper);
                var padder = $("<div></div>");
                padder.css("height", consoleHeight);
                padder.css("border-top", "5px solid white");
                $("body").append(padder);
              }
              var logLine = $("<div></div>");
              var ts = ibdiv();
              var spacer = ibdiv();
              var log = ibdiv();
              ts.text(timestamp());
              spacer.css("width", "20px");
              log.text(str);
              logLine.append([ts, spacer, log]);
              fakeConsole.append(logLine);
              fakeConsole.scrollTop(fakeConsole[0].scrollHeight);
              console.log(str); 
            };
            window.clearLogs = function() {
              var fakeConsole = $("div#console");
              if (fakeConsole.length) {
                fakeConsole.children().remove();
              }
            };
            window.convertCodeBlocks = convertCodeBlocks;
})();
