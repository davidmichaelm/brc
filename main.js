// Fixes XML not well formed warnings
$.ajaxSetup({beforeSend: function(xhr) {
    if (xhr.overrideMimeType) {
        xhr.overrideMimeType("application/json");
    }
}})

$.getJSON("schedule.json",  (data) => {
    
    let weekArray
    let nextReading = "none"
    let content = $(".content")

    for (week in data) {
        let index = Object.keys(data).indexOf(week)
        let weekId = "week" + index
        
        weekArray = data[week]
        content.append("<div id='" + weekId + "'><h3>" + week + "</h3></div>")
        
        for (day in weekArray) {
            let dayIndex = Object.keys(weekArray).indexOf(day)
            let dayId = weekId + "day" + dayIndex
            let boxId = dayId + "box"

            let readings = {
                "OT": weekArray[day]["OT"],
                "NT": weekArray[day]["NT"],
                "Psalm": weekArray[day]["Psalm"]
            }
            
            let OT = $("<span class='OT'></span>").append(readings["OT"])
            if (readings["Psalm"] != "") {
                var Psalm = $("<span class='Psalm'></span>").append(readings["Psalm"])
            }
            let NT = $("<span class='NT'></span>").append(readings["NT"])
            
            
            let dayInput = $("<input class='checkbox' type='checkbox' onclick='setCookie(this)'>").prop("id", boxId)
            let dayLabel = $("<label></label>").prop("for", boxId).append(OT)
            if (readings["Psalm"] != "") {
                dayLabel.append(Psalm)
            }
            dayLabel.append(NT)
            let dayTag = $("<div class='day'></div>").prop("id", dayId).append(dayInput, dayLabel)
            $("#" + weekId).append(dayTag)
            
            let checked = localStorage.getItem(boxId)
            if (checked == "true") {
                $("#" + boxId).prop("checked", true)
                $("#" + boxId + " + label").prop("class", "checked-true")
            } else {
                if (nextReading == "none") {
                    nextReading = weekId
                }
            }
        }
    }
    // do some set up after we have the JSON
    $(document).scroll(titleBar)

    let scrollType = localStorage.getItem("scrollType")
    if (scrollType == null) {
        scrollType = "nextReading"
    }
    scrollToDate(scrollType, false)
    $("#" + scrollType).prop("checked", true)


    let readingPlan = localStorage.getItem("readingPlan")
    if (readingPlan == null) {
        readingPlan = "wholeBible"
    }
    setReadingPlan(readingPlan)
    $("#" + readingPlan).prop("checked", true)

})

function setScrollType(type) {
    localStorage.setItem("scrollType", type)
    scrollToDate(type)
}

function scrollToDate(scrollType, animate = true) {
    let firstItem = localStorage.getItem("week0day0box")
    if (scrollType == "none" ||
     firstItem == null ||
     firstItem == "false") {
        return
    }

    let nextReading
    let screen = $([document.documentElement, document.body])

    if (scrollType == "nextReading") {
        let week = 0
        let day = 0

        while (day < 5) {
            let currentItem = "week" + week + "day" + day + "box"
            
            if (localStorage.getItem(currentItem) != "true") {
                nextReading = "week" + week
                break
            }

            day++
            
            if (day == 4) {
                if (week < 52) {
                    day = 0
                    week++
                }   
            }
        }
    } else if (scrollType == "currentDate") {
        let today = new Date()
        // month is 0 index based
        let october1 = new Date(2018, 10 - 1, 1)

        if (today < october1) {
            return
        }
        
        let weeksBetween = Math.floor((today - october1) / (7 * 24 * 60 * 60 * 1000))
        nextReading = "week" + weeksBetween
    }
    
    let scrollPos = $("#" + nextReading).offset().top - 70
    
    if (animate == true) {
        screen.animate({
            scrollTop: scrollPos
        }, 2000);
    } else {
        screen.scrollTop(scrollPos)
    }
}

function setReadingPlan(plan) {
    if (plan == "null") {
        plan = "wholeBible"
    }
    localStorage.setItem("readingPlan", plan)

    // clear commas, show hidden days
    $(".OT").toggleClass("comma", false)
    $(".Psalm").toggleClass("reverseComma", false)
    $(".Psalm").toggleClass("comma", false)
    $(".NT").toggleClass("comma", false)
    

    $(".day").filter(function() {
        return !this.childNodes[1].childNodes[2]
    }).show()

    let ot = $(".OT")
    let nt = $(".NT")
    let psalm = $(".Psalm")

    switch (plan) {
        case "wholeBible":
            ot.show().toggleClass("comma", true) 
            psalm.show().toggleClass("comma", true)
            nt.show()
            break
        case "NT":
            ot.hide()
            psalm.hide()
            nt.show()
            break
        case "NTPsalms":
            ot.hide()
            psalm.show().toggleClass("comma", true)
            nt.show()
            break
        case "OT":
            ot.show()
            psalm.show().toggleClass("reverseComma", true)
            nt.hide()
            break
        case "Psalms":
            ot.hide()
            psalm.show()
            nt.hide()

            // have to hide some days, aren't 5 readings in a week with just psalms
            $(".day").filter(function() {
                return !this.childNodes[1].childNodes[2]
            }).hide()
            break
    }
    
}

function setCookie(element) {
    localStorage.setItem(element.id, element.checked);
    $("#" + element.id + " + label").prop("class", "checked-" + element.checked)
}

function revealDialog(elementClass) {
    let element = $("." + elementClass)
    let otherElement

    if (elementClass == "settings") {
        otherElement = $(".aboutPane")
    } else {
        otherElement = $(".settings")
    }

    if (element.css("visibility") == "hidden") {
        element.addClass("display")
        otherElement.removeClass("display")
        
    } else {
        element.removeClass("display")
    }
}

function closeDialog() {
    let settings = $(".settings")
    let about = $(".aboutPane")

    settings.removeClass("display")
    about.removeClass("display")
}

function titleBar() {
    // make the alternate title visible once scrolled past the top one
    let y = $(this).scrollTop();
    //console.log(y)
    let title = $("#title")
    let topBarTitle = $('.topBarTitle')
    let topBar = $("#topBar")
    let container = $("#container")
    let titleHeight = title.offset().top + (title.height() / 2)

    if (y < titleHeight) {
        /*topBar.css("background-color", "")
        topBar.css("box-shadow", "")*/
        
        topBarTitle.css("opacity", "0")
        topBar.removeClass("scrolledBar")

        
    } else {
        topBarTitle.css("opacity", "1")
        topBar.addClass("scrolledBar")
    }
}