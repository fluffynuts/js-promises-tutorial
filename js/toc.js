(function() {
    $(document).ready(function() {
        var target = $("ol#toc");
        if (target.length === 0) {
            return;
        }
        var prev = null;
        var next = null;
        var hitCurrent = false;
        [
            ["Intro", "index.html"],
            ["Why", "why1.html"],
            ["How, part 1, with $: getting started", "jquery_getting_started.html"],
            ["How, part 2, with $: Handling rejection", "jquery_rejection.html"],
            ["Play it again, Q", "q.html"],
            ["Understanding through implementation", "custom.html"],
            ["Picky, Picky", "picky.html"],
            ["A mixed bag", "mixed.html"],
        ].forEach(function(item) {
            var li = $("<li></li>");
            var parts = window.location.href.split('/');
            var doc = parts[parts.length-1];
            if (doc.indexOf(".html") === -1) {
                doc = "index.html";
            }
            if (doc == item[1]) {
              li.text(item[0]);
              li.css("font-weight", "bold");
              hitCurrent = true;
            } else {
              var a = $("<a></a>");
              a.attr("href", item[1]);
              a.text(item[0]);
              if (!hitCurrent) {
                prev = a.clone();
              } else if (next === null) {
                next = a.clone();
              }
              li.append(a);
            }
            $(target).append(li);
        });
        var footer = $("<div></div>");
        var prevWrapper = $("<div></div>");
        prevWrapper.css({
          width: "40%",
          display: "inline-block",
          textAlign: "left"
        });
        if (prev && hitCurrent) {
          prev.text("<< " + prev.text());
          prevWrapper.append(prev);
        }
        footer.append(prevWrapper);
        var middleWrapper = $("<div></div>");
        middleWrapper.css({
          width: "20%",
          display: "inline-block",
          textAlign: "center"
        });
        window.setTimeout(function() {
          if (footer.offset().top > window.innerHeight) {
            var middleAnchor = $("<a></a>");
            middleAnchor.attr("href", "#");
            middleAnchor.text("Top");
            middleAnchor.on("click", function() {
              $(document).scrollTop(0);
            });
            middleWrapper.append(middleAnchor);
          }
        }, 1000);
        footer.append(middleWrapper);

        var nextWrapper = $("<div></div>");
        nextWrapper.css({
          width: "40%",
          display: "inline-block",
          textAlign: "right"
        });
        if (next) {
          next.text(next.text() + " >>");
          nextWrapper.append(next);
        }
        footer.append(nextWrapper);
        footer.attr("id", "footer");
        $("body").append(footer);
    });
})();
