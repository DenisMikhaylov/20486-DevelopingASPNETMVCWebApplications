//CdnPath=http://ajax.aspnetcdn.com/ajax/4.5/6/Menu.js
var __rootMenuItem;
var __menuInterval;
var __scrollPanel;
var __disappearAfter = 500;
function Menu_ClearInterval() {
    if (__menuInterval) {
        window.clearInterval(__menuInterval);
    }
}
function Menu_Collapse(item) {
    Menu_SetRoot(item);
    if (__rootMenuItem) {
        Menu_ClearInterval();
        if (__disappearAfter >= 0) {
            __menuInterval = window.setInterval("Menu_HideItems()", __disappearAfter);
        }
    }
}
function Menu_Expand(item, horizontalOffset, verticalOffset, hideScrollers) {
    Menu_ClearInterval();
    var tr = item.parentNode.parentNode.parentNode.parentNode.parentNode;
    var horizontal = true;
    if (!tr.id) {
        horizontal = false;
        tr = tr.parentNode;
    }
    var child = Menu_FindSubMenu(item);
    if (child) {
        var data = Menu_GetData(item);
        if (!data) {
            return null;
        }
        child.rel = tr.id;
        child.x = horizontalOffset;
        child.y = verticalOffset;
        if (horizontal) child.pos = "bottom";
        PopOut_Show(child.id, hideScrollers, data);
    }
    Menu_SetRoot(item);
    if (child) {
        if (!document.body.__oldOnClick && document.body.onclick) {
            document.body.__oldOnClick = document.body.onclick;
        }
        if (__rootMenuItem) {
            document.body.onclick = Menu_HideItems;
        }
    }
    Menu_ResetSiblings(tr);
    return child;
}
function Menu_FindMenu(item) {
    if (item && item.menu) return item.menu;
    var tr = item.parentNode.parentNode.parentNode.parentNode.parentNode;
    if (!tr.id) {
        tr = tr.parentNode;
    }
    for (var i = tr.id.length - 1; i >= 0; i--) {
        if (tr.id.charAt(i) < '0' || tr.id.charAt(i) > '9') {
            var menu = WebForm_GetElementById(tr.id.substr(0, i));
            if (menu) {
                item.menu = menu;
                return menu;
            }
        }
    }
    return null;
}
function Menu_FindNext(item) {
    var a = WebForm_GetElementByTagName(item, "A");
    var parent = Menu_FindParentContainer(item);
    var first = null;
    if (parent) {
        var links = WebForm_GetElementsByTagName(parent, "A");
        var match = false;
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (Menu_IsSelectable(link)) {
                if (Menu_FindParentContainer(link) == parent) {
                    if (match) {
                        return link;
                    }
                    else if (!first) {
                        first = link;
                    }
                }
                if (!match && link == a) {
                    match = true;
                }
            }
        }
    }
    return first;
}
function Menu_FindParentContainer(item) {
    if (item.menu_ParentContainerCache) return item.menu_ParentContainerCache;
    var a = (item.tagName.toLowerCase() == "a") ? item : WebForm_GetElementByTagName(item, "A");
    var menu = Menu_FindMenu(a);
    if (menu) {
        var parent = item;
        while (parent && parent.tagName &&
            parent.id != menu.id &&
            parent.tagName.toLowerCase() != "div") {
            parent = parent.parentNode;
        }
        item.menu_ParentContainerCache = parent;
        return parent;
    }
}
function Menu_FindParentItem(item) {
    var parentContainer = Menu_FindParentContainer(item);
    var parentContainerID = parentContainer.id;
    var len = parentContainerID.length;
    if (parentContainerID && parentContainerID.substr(len - 5) == "Items") {
        var parentItemID = parentContainerID.substr(0, len - 5);
        return WebForm_GetElementById(parentItemID);
    }
    return null;
}
function Menu_FindPrevious(item) {
    var a = WebForm_GetElementByTagName(item, "A");
    var parent = Menu_FindParentContainer(item);
    var last = null;
    if (parent) {
        var links = WebForm_GetElementsByTagName(parent, "A");
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (Menu_IsSelectable(link)) {
                if (link == a && last) {
                    return last;
                }
                if (Menu_FindParentContainer(link) == parent) {
                    last = link;
                }
            }
        }
    }
    return last;
}
function Menu_FindSubMenu(item) {
    var tr = item.parentNode.parentNode.parentNode.parentNode.parentNode;
    if (!tr.id) {
        tr=tr.parentNode;
    }
    return WebForm_GetElementById(tr.id + "Items");
}
function Menu_Focus(item) {
    if (item && item.focus) {
        var pos = WebForm_GetElementPosition(item);
        var parentContainer = Menu_FindParentContainer(item);
        if (!parentContainer.offset) {
            parentContainer.offset = 0;
        }
        var posParent = WebForm_GetElementPosition(parentContainer);
        var delta;
        if (pos.y + pos.height > posParent.y + parentContainer.offset + parentContainer.clippedHeight) {
            delta = pos.y + pos.height - posParent.y - parentContainer.offset - parentContainer.clippedHeight;
            PopOut_Scroll(parentContainer, delta);
        }
        else if (pos.y < posParent.y + parentContainer.offset) {
            delta = posParent.y + parentContainer.offset - pos.y;
            PopOut_Scroll(parentContainer, -delta);
        }
        PopOut_HideScrollers(parentContainer);
        item.focus();
    }
}
function Menu_GetData(item) {
    if (!item.data) {
        var a = (item.tagName.toLowerCase() == "a" ? item : WebForm_GetElementByTagName(item, "a"));
        var menu = Menu_FindMenu(a);
        try {
            item.data = eval(menu.id + "_Data");
        }
        catch(e) {}
    }
    return item.data;
}
function Menu_HideItems(items) {
    if (document.body.__oldOnClick) {
        document.body.onclick = document.body.__oldOnClick;
        document.body.__oldOnClick = null;
    }
    Menu_ClearInterval();
    if (!items || ((typeof(items.tagName) == "undefined") && (items instanceof Event))) {
        items = __rootMenuItem;
    }
    var table = items;
    if ((typeof(table) == "undefined") || (table == null) || !table.tagName || (table.tagName.toLowerCase() != "table")) {
        table = WebForm_GetElementByTagName(table, "TABLE");
    }
    if ((typeof(table) == "undefined") || (table == null) || !table.tagName || (table.tagName.toLowerCase() != "table")) {
        return;
    }
    var rows = table.rows ? table.rows : table.firstChild.rows;
    var isVertical = false;
    for (var r = 0; r < rows.length; r++) {
        if (rows[r].id) {
            isVertical = true;
            break;
        }
    }
    var i, child, nextLevel;
    if (isVertical) {
        for(i = 0; i < rows.length; i++) {
            if (rows[i].id) {
                child = WebForm_GetElementById(rows[i].id + "Items");
                if (child) {
                    Menu_HideItems(child);
                }
            }
            else if (rows[i].cells[0]) {
                nextLevel = WebForm_GetElementByTagName(rows[i].cells[0], "TABLE");
                if (nextLevel) {
                    Menu_HideItems(nextLevel);
                }
            }
        }
    }
    else if (rows[0]) {
        for(i = 0; i < rows[0].cells.length; i++) {
            if (rows[0].cells[i].id) {
                child = WebForm_GetElementById(rows[0].cells[i].id + "Items");
                if (child) {
                    Menu_HideItems(child);
                }
            }
            else {
                nextLevel = WebForm_GetElementByTagName(rows[0].cells[i], "TABLE");
                if (nextLevel) {
                    Menu_HideItems(rows[0].cells[i].firstChild);
                }
            }
        }
    }
    if (items && items.id) {
        PopOut_Hide(items.id);
    }
}
function Menu_HoverDisabled(item) {
    var node = (item.tagName.toLowerCase() == "td") ?
        item:
        item.cells[0];
    var data = Menu_GetData(item);
    if (!data) return;
    node = WebForm_GetElementByTagName(node, "table").rows[0].cells[0].childNodes[0];
    if (data.disappearAfter >= 200) {
        __disappearAfter = data.disappearAfter;
    }
    Menu_Expand(node, data.horizontalOffset, data.verticalOffset); 
}
function Menu_HoverDynamic(item) {
    var node = (item.tagName.toLowerCase() == "td") ?
        item:
        item.cells[0];
    var data = Menu_GetData(item);
    if (!data) return;
    var nodeTable = WebForm_GetElementByTagName(node, "table");
    if (data.hoverClass) {
        nodeTable.hoverClass = data.hoverClass;
        WebForm_AppendToClassName(nodeTable, data.hoverClass);
    }
    node = nodeTable.rows[0].cells[0].childNodes[0];
    if (data.hoverHyperLinkClass) {
        node.hoverHyperLinkClass = data.hoverHyperLinkClass;
        WebForm_AppendToClassName(node, data.hoverHyperLinkClass);
    }
    if (data.disappearAfter >= 200) {
        __disappearAfter = data.disappearAfter;
    }
    Menu_Expand(node, data.horizontalOffset, data.verticalOffset); 
}
function Menu_HoverRoot(item) {
    var node = (item.tagName.toLowerCase() == "td") ?
        item:
        item.cells[0];
    var data = Menu_GetData(item);
    if (!data) {
        return null;
    }
    var nodeTable = WebForm_GetElementByTagName(node, "table");
    if (data.staticHoverClass) {
        nodeTable.hoverClass = data.staticHoverClass;
        WebForm_AppendToClassName(nodeTable, data.staticHoverClass);
    }
    node = nodeTable.rows[0].cells[0].childNodes[0];
    if (data.staticHoverHyperLinkClass) {
        node.hoverHyperLinkClass = data.staticHoverHyperLinkClass;
        WebForm_AppendToClassName(node, data.staticHoverHyperLinkClass);
    }
    return node;
}
function Menu_HoverStatic(item) {
    var node = Menu_HoverRoot(item);
    var data = Menu_GetData(item);
    if (!data) return;
    __disappearAfter = data.disappearAfter;
    Menu_Expand(node, data.horizontalOffset, data.verticalOffset); 
}
function Menu_IsHorizontal(item) {
    if (item) {
        var a = ((item.tagName && (item.tagName.toLowerCase == "a")) ? item : WebForm_GetElementByTagName(item, "A"));
        if (!a) {
            return false;
        }
        var td = a.parentNode.parentNode.parentNode.parentNode.parentNode;
        if (td.id) {
            return true;
        }
    }
    return false;
}
function Menu_IsSelectable(link) {
    return (link && link.href)
}
function Menu_Key(item) {
    var event;
    if (window.event) {
        event = window.event;
    }
    else {
        event = item;
        item = event.currentTarget;
    }
    var key = (event ? event.keyCode : -1);
    var data = Menu_GetData(item);
    if (!data) return;
    var horizontal = Menu_IsHorizontal(item);
    var a = WebForm_GetElementByTagName(item, "A");
    var nextItem, parentItem, previousItem;
    if ((!horizontal && key == 38) || (horizontal && key == 37)) {
        previousItem = Menu_FindPrevious(item);
        while (previousItem && previousItem.disabled) {
            previousItem = Menu_FindPrevious(previousItem);
        }
        if (previousItem) {
            Menu_Focus(previousItem);
            Menu_Expand(previousItem, data.horizontalOffset, data.verticalOffset, true);
            event.cancelBubble = true;
            if (event.stopPropagation) event.stopPropagation();
            return;
        }
    }
    if ((!horizontal && key == 40) || (horizontal && key == 39)) {
        if (horizontal) {
            var subMenu = Menu_FindSubMenu(a);
            if (subMenu && subMenu.style && subMenu.style.visibility && 
                subMenu.style.visibility.toLowerCase() == "hidden") {
                Menu_Expand(a, data.horizontalOffset, data.verticalOffset, true);
                event.cancelBubble = true;
                if (event.stopPropagation) event.stopPropagation();
                return;
            }
        }
        nextItem = Menu_FindNext(item);
        while (nextItem && nextItem.disabled) {
            nextItem = Menu_FindNext(nextItem);
        }
        if (nextItem) {
            Menu_Focus(nextItem);
            Menu_Expand(nextItem, data.horizontalOffset, data.verticalOffset, true);
            event.cancelBubble = true;
            if (event.stopPropagation) event.stopPropagation();
            return;
        }
    }
    if ((!horizontal && key == 39) || (horizontal && key == 40)) {
        var children = Menu_Expand(a, data.horizontalOffset, data.verticalOffset, true);
        if (children) {
            var firstChild;
            children = WebForm_GetElementsByTagName(children, "A");
            for (var i = 0; i < children.length; i++) {
                if (!children[i].disabled && Menu_IsSelectable(children[i])) {
                    firstChild = children[i];
                    break;
                }
            }
            if (firstChild) {
                Menu_Focus(firstChild);
                Menu_Expand(firstChild, data.horizontalOffset, data.verticalOffset, true);
                event.cancelBubble = true;
                if (event.stopPropagation) event.stopPropagation();
                return;
            }
        }
        else {
            parentItem = Menu_FindParentItem(item);
            while (parentItem && !Menu_IsHorizontal(parentItem)) {
                parentItem = Menu_FindParentItem(parentItem);
            }
            if (parentItem) {
                nextItem = Menu_FindNext(parentItem);
                while (nextItem && nextItem.disabled) {
                    nextItem = Menu_FindNext(nextItem);
                }
                if (nextItem) {
                    Menu_Focus(nextItem);
                    Menu_Expand(nextItem, data.horizontalOffset, data.verticalOffset, true);
                    event.cancelBubble = true;
                    if (event.stopPropagation) event.stopPropagation();
                    return;
                }
            }
        }
    }
    if ((!horizontal && key == 37) || (horizontal && key == 38)) {
        parentItem = Menu_FindParentItem(item);
        if (parentItem) {
            if (Menu_IsHorizontal(parentItem)) {
                previousItem = Menu_FindPrevious(parentItem);
                while (previousItem && previousItem.disabled) {
                    previousItem = Menu_FindPrevious(previousItem);
                }
                if (previousItem) {
                    Menu_Focus(previousItem);
                    Menu_Expand(previousItem, data.horizontalOffset, data.verticalOffset, true);
                    event.cancelBubble = true;
                    if (event.stopPropagation) event.stopPropagation();
                    return;
                }
            }
            var parentA = WebForm_GetElementByTagName(parentItem, "A");
            if (parentA) {
                Menu_Focus(parentA);
            }
            Menu_ResetSiblings(parentItem);
            event.cancelBubble = true;
            if (event.stopPropagation) event.stopPropagation();
            return;
        }
    }
    if (key == 27) {
        Menu_HideItems();
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
        return;
    }
}
function Menu_ResetSiblings(item) {
    var table = (item.tagName.toLowerCase() == "td") ?
        item.parentNode.parentNode.parentNode :
        item.parentNode.parentNode;
    var isVertical = false;
    for (var r = 0; r < table.rows.length; r++) {
        if (table.rows[r].id) {
            isVertical = true;
            break;
        }
    }
    var i, child, childNode;
    if (isVertical) {
        for(i = 0; i < table.rows.length; i++) {
            childNode = table.rows[i];
            if (childNode != item) {
                child = WebForm_GetElementById(childNode.id + "Items");
                if (child) {
                    Menu_HideItems(child);
                }
            }
        }
    }
    else {
        for(i = 0; i < table.rows[0].cells.length; i++) {
            childNode = table.rows[0].cells[i];
            if (childNode != item) {
                child = WebForm_GetElementById(childNode.id + "Items");
                if (child) {
                    Menu_HideItems(child);
                }
            }
        }
    }
    Menu_ResetTopMenus(table, table, 0, true);
}
function Menu_ResetTopMenus(table, doNotReset, level, up) {
    var i, child, childNode;
    if (up && table.id == "") {
        var parentTable = table.parentNode.parentNode.parentNode.parentNode;
        if (parentTable.tagName.toLowerCase() == "table") {
            Menu_ResetTopMenus(parentTable, doNotReset, level + 1, true);
        }
    }
    else {
        if (level == 0 && table != doNotReset) {
            if (table.rows[0].id) {
                for(i = 0; i < table.rows.length; i++) {
                    childNode = table.rows[i];
                    child = WebForm_GetElementById(childNode.id + "Items");
                    if (child) {
                        Menu_HideItems(child);
                    }
                }
            }
            else {
                for(i = 0; i < table.rows[0].cells.length; i++) {
                    childNode = table.rows[0].cells[i];
                    child = WebForm_GetElementById(childNode.id + "Items");
                    if (child) {
                        Menu_HideItems(child);
                    }
                }
            }
        }
        else if (level > 0) {
            for (i = 0; i < table.rows.length; i++) {
                for (var j = 0; j < table.rows[i].cells.length; j++) {
                    var subTable = table.rows[i].cells[j].firstChild;
                    if (subTable && subTable.tagName.toLowerCase() == "table") {
                        Menu_ResetTopMenus(subTable, doNotReset, level - 1, false);
                    }
                }
            }
        }
    }
}
function Menu_RestoreInterval() {
    if (__menuInterval && __rootMenuItem) {
        Menu_ClearInterval();
        __menuInterval = window.setInterval("Menu_HideItems()", __disappearAfter);
    }
}
function Menu_SetRoot(item) {
    var newRoot = Menu_FindMenu(item);
    if (newRoot) {
        if (__rootMenuItem && __rootMenuItem != newRoot) {
            Menu_HideItems();
        }
        __rootMenuItem = newRoot;
    }
}
function Menu_Unhover(item) {
    var node = (item.tagName.toLowerCase() == "td") ?
        item:
        item.cells[0];
    var nodeTable = WebForm_GetElementByTagName(node, "table");
    if (nodeTable.hoverClass) {
        WebForm_RemoveClassName(nodeTable, nodeTable.hoverClass);
    }
    node = nodeTable.rows[0].cells[0].childNodes[0];
    if (node.hoverHyperLinkClass) {
        WebForm_RemoveClassName(node, node.hoverHyperLinkClass);
    }
    Menu_Collapse(node);
}
function PopOut_Clip(element, y, height) {
    if (element && element.style) {
        element.style.clip = "rect(" + y + "px auto " + (y + height) + "px auto)";
        element.style.overflow = "hidden";
    }
}
function PopOut_Down(scroller) {
    Menu_ClearInterval();
    var panel;
    if (scroller) {
        panel = scroller.parentNode
    }
    else {
        panel = __scrollPanel;
    }
    if (panel && ((panel.offset + panel.clippedHeight) < panel.physicalHeight)) {
        PopOut_Scroll(panel, 2)
        __scrollPanel = panel;
        PopOut_ShowScrollers(panel);
        PopOut_Stop();
        __scrollPanel.interval = window.setInterval("PopOut_Down()", 8);
    }
    else {
        PopOut_ShowScrollers(panel);
    }
}
function PopOut_Hide(panelId) {
    var panel = WebForm_GetElementById(panelId);
    if (panel && panel.tagName.toLowerCase() == "div") {
        panel.style.visibility = "hidden";
        panel.style.display = "none";
        panel.offset = 0;
        panel.scrollTop = 0;
        var table = WebForm_GetElementByTagName(panel, "TABLE");
        if (table) {
            WebForm_SetElementY(table, 0);
        }
        if (window.navigator && window.navigator.appName == "Microsoft Internet Explorer" &&
            !window.opera) {
            var childFrameId = panel.id + "_MenuIFrame";
            var childFrame = WebForm_GetElementById(childFrameId);
            if (childFrame) {
                childFrame.style.display = "none";
            }
        }
    }
}
function PopOut_HideScrollers(panel) {
    if (panel && panel.style) {
        var up = WebForm_GetElementById(panel.id + "Up");
        var dn = WebForm_GetElementById(panel.id + "Dn");
        if (up) {
            up.style.visibility = "hidden";
            up.style.display = "none";
        }
        if (dn) {
            dn.style.visibility = "hidden";
            dn.style.display = "none";
        }
    }
}
function PopOut_Position(panel, hideScrollers) {
    if (window.opera) {
        panel.parentNode.removeChild(panel);
        document.forms[0].appendChild(panel);
    }
    var rel = WebForm_GetElementById(panel.rel);
    var relTable = WebForm_GetElementByTagName(rel, "TABLE");
    var relCoordinates = WebForm_GetElementPosition(relTable ? relTable : rel);
    var panelCoordinates = WebForm_GetElementPosition(panel);
    var panelHeight = ((typeof(panel.physicalHeight) != "undefined") && (panel.physicalHeight != null)) ?
        panel.physicalHeight :
        panelCoordinates.height;
    panel.physicalHeight = panelHeight;
    var panelParentCoordinates;
    if (panel.offsetParent) {
        panelParentCoordinates = WebForm_GetElementPosition(panel.offsetParent);
    }
    else {
        panelParentCoordinates = new Object();
        panelParentCoordinates.x = 0;
        panelParentCoordinates.y = 0;
    }
    var overflowElement = WebForm_GetElementById("__overFlowElement");
    if (!overflowElement) {
        overflowElement = document.createElement("img");
        overflowElement.id="__overFlowElement";
        WebForm_SetElementWidth(overflowElement, 1);
        document.body.appendChild(overflowElement);
    }
    WebForm_SetElementHeight(overflowElement, panelHeight + relCoordinates.y + parseInt(panel.y ? panel.y : 0));
    overflowElement.style.visibility = "visible";
    overflowElement.style.display = "inline";
    var clientHeight = 0;
    var clientWidth = 0;
    if (window.innerHeight) {
        clientHeight = window.innerHeight;
        clientWidth = window.innerWidth;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
        clientHeight = document.documentElement.clientHeight;
        clientWidth = document.documentElement.clientWidth;
    }
    else if (document.body && document.body.clientHeight) {
        clientHeight = document.body.clientHeight;
        clientWidth = document.body.clientWidth;
    }
    var scrollTop = 0;
    var scrollLeft = 0;
    if (typeof(window.pageYOffset) != "undefined") {
        scrollTop = window.pageYOffset;
        scrollLeft = window.pageXOffset;
    }
    else if (document.documentElement && (typeof(document.documentElement.scrollTop) != "undefined")) {
        scrollTop = document.documentElement.scrollTop;
        scrollLeft = document.documentElement.scrollLeft;
    }
    else if (document.body && (typeof(document.body.scrollTop) != "undefined")) {
        scrollTop = document.body.scrollTop;
        scrollLeft = document.body.scrollLeft;
    }
    overflowElement.style.visibility = "hidden";
    overflowElement.style.display = "none";
    var bottomWindowBorder = clientHeight + scrollTop;
    var rightWindowBorder = clientWidth + scrollLeft;
    var position = panel.pos;
    if ((typeof(position) == "undefined") || (position == null) || (position == "")) {
        position = (WebForm_GetElementDir(rel) == "rtl" ? "middleleft" : "middleright");
    }
    position = position.toLowerCase();
    var y = relCoordinates.y + parseInt(panel.y ? panel.y : 0) - panelParentCoordinates.y;
    var borderParent = (rel && rel.parentNode && rel.parentNode.parentNode && rel.parentNode.parentNode.parentNode
        && rel.parentNode.parentNode.parentNode.tagName.toLowerCase() == "div") ?
        rel.parentNode.parentNode.parentNode : null;
    WebForm_SetElementY(panel, y);
    PopOut_SetPanelHeight(panel, panelHeight, true);
    var clip = false;
    var overflow;
    if (position.indexOf("top") != -1) {
        y -= panelHeight;
        WebForm_SetElementY(panel, y); 
        if (y < -panelParentCoordinates.y) {
            y = -panelParentCoordinates.y;
            WebForm_SetElementY(panel, y); 
            if (panelHeight > clientHeight - 2) {
                clip = true;
                PopOut_SetPanelHeight(panel, clientHeight - 2);
            }
        }
    }
    else {
        if (position.indexOf("bottom") != -1) {
            y += relCoordinates.height;
            WebForm_SetElementY(panel, y); 
        }
        overflow = y + panelParentCoordinates.y + panelHeight - bottomWindowBorder;
        if (overflow > 0) {
            y -= overflow;
            WebForm_SetElementY(panel, y); 
            if (y < -panelParentCoordinates.y) {
                y = 2 - panelParentCoordinates.y + scrollTop;
                WebForm_SetElementY(panel, y); 
                clip = true;
                PopOut_SetPanelHeight(panel, clientHeight - 2);
            }
        }
    }
    if (!clip) {
        PopOut_SetPanelHeight(panel, panel.clippedHeight, true);
    }
    var panelParentOffsetY = 0;
    if (panel.offsetParent) {
        panelParentOffsetY = WebForm_GetElementPosition(panel.offsetParent).y;
    }
    var panelY = ((typeof(panel.originY) != "undefined") && (panel.originY != null)) ?
        panel.originY :
        y - panelParentOffsetY;
    panel.originY = panelY;
    if (!hideScrollers) {
        PopOut_ShowScrollers(panel);
    }
    else {
        PopOut_HideScrollers(panel);
    }
    var x = relCoordinates.x + parseInt(panel.x ? panel.x : 0) - panelParentCoordinates.x;
    if (borderParent && borderParent.clientLeft) {
        x += 2 * borderParent.clientLeft;
    }
    WebForm_SetElementX(panel, x);
    if (position.indexOf("left") != -1) {
        x -= panelCoordinates.width;
        WebForm_SetElementX(panel, x);
        if (x < -panelParentCoordinates.x) {
            WebForm_SetElementX(panel, -panelParentCoordinates.x);
        }
    }
    else {
        if (position.indexOf("right") != -1) {
            x += relCoordinates.width;
            WebForm_SetElementX(panel, x);
        }
        overflow = x + panelParentCoordinates.x + panelCoordinates.width - rightWindowBorder;
        if (overflow > 0) {
            if (position.indexOf("bottom") == -1 && relCoordinates.x > panelCoordinates.width) {
                x -= relCoordinates.width + panelCoordinates.width;
            }
            else {
                x -= overflow;
            }
            WebForm_SetElementX(panel, x);
            if (x < -panelParentCoordinates.x) {
                WebForm_SetElementX(panel, -panelParentCoordinates.x);
            }
        }
    }
}
function PopOut_Scroll(panel, offsetDelta) {
    var table = WebForm_GetElementByTagName(panel, "TABLE");
    if (!table) return;
    table.style.position = "relative";
    var tableY = (table.style.top ? parseInt(table.style.top) : 0);
    panel.offset += offsetDelta;
    WebForm_SetElementY(table, tableY - offsetDelta);
}
function PopOut_SetPanelHeight(element, height, doNotClip) {
    if (element && element.style) {
        var size = WebForm_GetElementPosition(element);
        element.physicalWidth = size.width;
        element.clippedHeight = height;
        WebForm_SetElementHeight(element, height - (element.clientTop ? (2 * element.clientTop) : 0));
        if (doNotClip && element.style) {
            element.style.clip = "rect(auto auto auto auto)";
        }
        else {
            PopOut_Clip(element, 0, height);
        }
    }
}
function PopOut_Show(panelId, hideScrollers, data) {
    var panel = WebForm_GetElementById(panelId);
    if (panel && panel.tagName.toLowerCase() == "div") {
        panel.style.visibility = "visible";
        panel.style.display = "inline";
        if (!panel.offset || hideScrollers) {
            panel.scrollTop = 0;
            panel.offset = 0;
            var table = WebForm_GetElementByTagName(panel, "TABLE");
            if (table) {
                WebForm_SetElementY(table, 0);
            }
        }
        PopOut_Position(panel, hideScrollers);
        var z = 1;
        var isIE = window.navigator && window.navigator.appName == "Microsoft Internet Explorer" && !window.opera;
        if (isIE && data) {
            var childFrameId = panel.id + "_MenuIFrame";
            var childFrame = WebForm_GetElementById(childFrameId);
            var parent = panel.offsetParent;
            if (!childFrame) {
                childFrame = document.createElement("iframe");
                childFrame.id = childFrameId;
                childFrame.src = (data.iframeUrl ? data.iframeUrl : "about:blank");
                childFrame.style.position = "absolute";
                childFrame.style.display = "none";
                childFrame.scrolling = "no";
                childFrame.frameBorder = "0";
                if (parent.tagName.toLowerCase() == "html") {
                    document.body.appendChild(childFrame);
                }
                else {
                    parent.appendChild(childFrame);
                }
            }
            var pos = WebForm_GetElementPosition(panel);
            var parentPos = WebForm_GetElementPosition(parent);
            WebForm_SetElementX(childFrame, pos.x - parentPos.x);
            WebForm_SetElementY(childFrame, pos.y - parentPos.y);
            WebForm_SetElementWidth(childFrame, pos.width);
            WebForm_SetElementHeight(childFrame, pos.height);
            childFrame.style.display = "block";
            if (panel.currentStyle && panel.currentStyle.zIndex && panel.currentStyle.zIndex != "auto") {
                z = panel.currentStyle.zIndex;
            }
            else if (panel.style.zIndex) {
                z = panel.style.zIndex;
            }
        }
        panel.style.zIndex = z;
    }
}
function PopOut_ShowScrollers(panel) {
    if (panel && panel.style) {
        var up = WebForm_GetElementById(panel.id + "Up");
        var dn = WebForm_GetElementById(panel.id + "Dn");
        var cnt = 0;
        if (up && dn) {
            if (panel.offset && panel.offset > 0) {
                up.style.visibility = "visible";
                up.style.display = "inline";
                cnt++;
                if (panel.clientWidth) {
                    WebForm_SetElementWidth(up, panel.clientWidth
                        - (up.clientLeft ? (2 * up.clientLeft) : 0));
                }
                WebForm_SetElementY(up, 0);
            }
            else {
                up.style.visibility = "hidden";
                up.style.display = "none";
            }
            if (panel.offset + panel.clippedHeight + 2 <= panel.physicalHeight) {
                dn.style.visibility = "visible";
                dn.style.display = "inline";
                cnt++;
                if (panel.clientWidth) {
                    WebForm_SetElementWidth(dn, panel.clientWidth
                        - (dn.clientLeft ? (2 * dn.clientLeft) : 0));
                }
                WebForm_SetElementY(dn, panel.clippedHeight - WebForm_GetElementPosition(dn).height
                    - (panel.clientTop ? (2 * panel.clientTop) : 0));
            }
            else {
                dn.style.visibility = "hidden";
                dn.style.display = "none";
            }
            if (cnt == 0) {
                panel.style.clip = "rect(auto auto auto auto)";
            }
        }
    }
}
function PopOut_Stop() {
    if (__scrollPanel && __scrollPanel.interval) {
        window.clearInterval(__scrollPanel.interval);
    }
    Menu_RestoreInterval();
}
function PopOut_Up(scroller) {
    Menu_ClearInterval();
    var panel;
    if (scroller) {
        panel = scroller.parentNode
    }
    else {
        panel = __scrollPanel;
    }
    if (panel && panel.offset && panel.offset > 0) {
        PopOut_Scroll(panel, -2);
        __scrollPanel = panel;
        PopOut_ShowScrollers(panel);
        PopOut_Stop();
        __scrollPanel.interval = window.setInterval("PopOut_Up()", 8);
    }
}

// SIG // Begin signature block
// SIG // MIIauwYJKoZIhvcNAQcCoIIarDCCGqgCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFOQvJNmaK3RU
// SIG // yqKbnWD8KJym5AndoIIVgjCCBMMwggOroAMCAQICEzMA
// SIG // AAArOTJIwbLJSPMAAAAAACswDQYJKoZIhvcNAQEFBQAw
// SIG // dzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBMB4XDTEyMDkwNDIx
// SIG // MTIzNFoXDTEzMTIwNDIxMTIzNFowgbMxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xDTALBgNVBAsTBE1PUFIxJzAlBgNVBAsT
// SIG // Hm5DaXBoZXIgRFNFIEVTTjpDMEY0LTMwODYtREVGODEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
// SIG // ggEBAKa2MA4DZa5QWoZrhZ9IoR7JwO5eSQeF4HCWfL65
// SIG // X2JfBibTizm7GCKlLpKt2EuIOhqvm4OuyF45jMIyexZ4
// SIG // 7Tc4OvFi+2iCAmjs67tAirH+oSw2YmBwOWBiDvvGGDhv
// SIG // sJLWQA2Apg14izZrhoomFxj/sOtNurspE+ZcSI5wRjYm
// SIG // /jQ1qzTh99rYXOqZfTG3TR9X63zWlQ1mDB4OMhc+LNWA
// SIG // oc7r95iRAtzBX/04gPg5f11kyjdcO1FbXYVfzh4c+zS+
// SIG // X+UoVXBUnLjsfABVRlsomChWTOHxugkZloFIKjDI9zMg
// SIG // bOdpw7PUw07PMB431JhS1KkjRbKuXEFJT7RiaJMCAwEA
// SIG // AaOCAQkwggEFMB0GA1UdDgQWBBSlGDNTP5VgoUMW747G
// SIG // r9Irup5Y0DAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7
// SIG // syuwwzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsG
// SIG // AQUFBwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3Nv
// SIG // ZnRUaW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsG
// SIG // AQUFBwMIMA0GCSqGSIb3DQEBBQUAA4IBAQB+zLB75S++
// SIG // 51a1z3PbqlLRFjnGtM361/4eZbXnSPObRogFZmomhl7+
// SIG // h1jcxmOOOID0CEZ8K3OxDr9BqsvHqpSkN/BkOeHF1fnO
// SIG // B86r5CXwaa7URuL+ZjI815fFMiH67holoF4MQiwRMzqC
// SIG // g/3tHbO+zpGkkSVxuatysJ6v5M8AYolwqbhKUIzuLyJk
// SIG // pajmTWuVLBx57KejMdqQYJCkbv6TAg0/LCQNxmomgVGD
// SIG // ShC7dWNEqmkIxgPr4s8L7VY67O9ypwoM9ADTIrivInKz
// SIG // 58ScCyiggMrj4dc5ZjDnRhcY5/qC+lkLeryoDf4c/wOL
// SIG // Y7JNEgIjTy2zhYQ74qFH6M8VMIIE7DCCA9SgAwIBAgIT
// SIG // MwAAALARrwqL0Duf3QABAAAAsDANBgkqhkiG9w0BAQUF
// SIG // ADB5MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSMwIQYDVQQDExpN
// SIG // aWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQTAeFw0xMzAx
// SIG // MjQyMjMzMzlaFw0xNDA0MjQyMjMzMzlaMIGDMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMQ0wCwYDVQQLEwRNT1BSMR4wHAYD
// SIG // VQQDExVNaWNyb3NvZnQgQ29ycG9yYXRpb24wggEiMA0G
// SIG // CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDor1yiIA34
// SIG // KHy8BXt/re7rdqwoUz8620B9s44z5lc/pVEVNFSlz7SL
// SIG // qT+oN+EtUO01Fk7vTXrbE3aIsCzwWVyp6+HXKXXkG4Un
// SIG // m/P4LZ5BNisLQPu+O7q5XHWTFlJLyjPFN7Dz636o9UEV
// SIG // XAhlHSE38Cy6IgsQsRCddyKFhHxPuRuQsPWj/ov0DJpO
// SIG // oPXJCiHiquMBNkf9L4JqgQP1qTXclFed+0vUDoLbOI8S
// SIG // /uPWenSIZOFixCUuKq6dGB8OHrbCryS0DlC83hyTXEmm
// SIG // ebW22875cHsoAYS4KinPv6kFBeHgD3FN/a1cI4Mp68fF
// SIG // SsjoJ4TTfsZDC5UABbFPZXHFAgMBAAGjggFgMIIBXDAT
// SIG // BgNVHSUEDDAKBggrBgEFBQcDAzAdBgNVHQ4EFgQUWXGm
// SIG // WjNN2pgHgP+EHr6H+XIyQfIwUQYDVR0RBEowSKRGMEQx
// SIG // DTALBgNVBAsTBE1PUFIxMzAxBgNVBAUTKjMxNTk1KzRm
// SIG // YWYwYjcxLWFkMzctNGFhMy1hNjcxLTc2YmMwNTIzNDRh
// SIG // ZDAfBgNVHSMEGDAWgBTLEejK0rQWWAHJNy4zFha5TJoK
// SIG // HzBWBgNVHR8ETzBNMEugSaBHhkVodHRwOi8vY3JsLm1p
// SIG // Y3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9NaWND
// SIG // b2RTaWdQQ0FfMDgtMzEtMjAxMC5jcmwwWgYIKwYBBQUH
// SIG // AQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY0NvZFNpZ1BD
// SIG // QV8wOC0zMS0yMDEwLmNydDANBgkqhkiG9w0BAQUFAAOC
// SIG // AQEAMdduKhJXM4HVncbr+TrURE0Inu5e32pbt3nPApy8
// SIG // dmiekKGcC8N/oozxTbqVOfsN4OGb9F0kDxuNiBU6fNut
// SIG // zrPJbLo5LEV9JBFUJjANDf9H6gMH5eRmXSx7nR2pEPoc
// SIG // sHTyT2lrnqkkhNrtlqDfc6TvahqsS2Ke8XzAFH9IzU2y
// SIG // RPnwPJNtQtjofOYXoJtoaAko+QKX7xEDumdSrcHps3Om
// SIG // 0mPNSuI+5PNO/f+h4LsCEztdIN5VP6OukEAxOHUoXgSp
// SIG // Rm3m9Xp5QL0fzehF1a7iXT71dcfmZmNgzNWahIeNJDD3
// SIG // 7zTQYx2xQmdKDku/Og7vtpU6pzjkJZIIpohmgjCCBbww
// SIG // ggOkoAMCAQICCmEzJhoAAAAAADEwDQYJKoZIhvcNAQEF
// SIG // BQAwXzETMBEGCgmSJomT8ixkARkWA2NvbTEZMBcGCgmS
// SIG // JomT8ixkARkWCW1pY3Jvc29mdDEtMCsGA1UEAxMkTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // MB4XDTEwMDgzMTIyMTkzMloXDTIwMDgzMTIyMjkzMlow
// SIG // eTELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEjMCEGA1UEAxMaTWlj
// SIG // cm9zb2Z0IENvZGUgU2lnbmluZyBQQ0EwggEiMA0GCSqG
// SIG // SIb3DQEBAQUAA4IBDwAwggEKAoIBAQCycllcGTBkvx2a
// SIG // YCAgQpl2U2w+G9ZvzMvx6mv+lxYQ4N86dIMaty+gMuz/
// SIG // 3sJCTiPVcgDbNVcKicquIEn08GisTUuNpb15S3GbRwfa
// SIG // /SXfnXWIz6pzRH/XgdvzvfI2pMlcRdyvrT3gKGiXGqel
// SIG // cnNW8ReU5P01lHKg1nZfHndFg4U4FtBzWwW6Z1KNpbJp
// SIG // L9oZC/6SdCnidi9U3RQwWfjSjWL9y8lfRjFQuScT5EAw
// SIG // z3IpECgixzdOPaAyPZDNoTgGhVxOVoIoKgUyt0vXT2Pn
// SIG // 0i1i8UU956wIAPZGoZ7RW4wmU+h6qkryRs83PDietHdc
// SIG // pReejcsRj1Y8wawJXwPTAgMBAAGjggFeMIIBWjAPBgNV
// SIG // HRMBAf8EBTADAQH/MB0GA1UdDgQWBBTLEejK0rQWWAHJ
// SIG // Ny4zFha5TJoKHzALBgNVHQ8EBAMCAYYwEgYJKwYBBAGC
// SIG // NxUBBAUCAwEAATAjBgkrBgEEAYI3FQIEFgQU/dExTtMm
// SIG // ipXhmGA7qDFvpjy82C0wGQYJKwYBBAGCNxQCBAweCgBT
// SIG // AHUAYgBDAEEwHwYDVR0jBBgwFoAUDqyCYEBWJ5flJRP8
// SIG // KuEKU5VZ5KQwUAYDVR0fBEkwRzBFoEOgQYY/aHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvbWljcm9zb2Z0cm9vdGNlcnQuY3JsMFQGCCsGAQUF
// SIG // BwEBBEgwRjBEBggrBgEFBQcwAoY4aHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3NvZnRS
// SIG // b290Q2VydC5jcnQwDQYJKoZIhvcNAQEFBQADggIBAFk5
// SIG // Pn8mRq/rb0CxMrVq6w4vbqhJ9+tfde1MOy3XQ60L/svp
// SIG // LTGjI8x8UJiAIV2sPS9MuqKoVpzjcLu4tPh5tUly9z7q
// SIG // QX/K4QwXaculnCAt+gtQxFbNLeNK0rxw56gNogOlVuC4
// SIG // iktX8pVCnPHz7+7jhh80PLhWmvBTI4UqpIIck+KUBx3y
// SIG // 4k74jKHK6BOlkU7IG9KPcpUqcW2bGvgc8FPWZ8wi/1wd
// SIG // zaKMvSeyeWNWRKJRzfnpo1hW3ZsCRUQvX/TartSCMm78
// SIG // pJUT5Otp56miLL7IKxAOZY6Z2/Wi+hImCWU4lPF6H0q7
// SIG // 0eFW6NB4lhhcyTUWX92THUmOLb6tNEQc7hAVGgBd3TVb
// SIG // Ic6YxwnuhQ6MT20OE049fClInHLR82zKwexwo1eSV32U
// SIG // jaAbSANa98+jZwp0pTbtLS8XyOZyNxL0b7E8Z4L5UrKN
// SIG // MxZlHg6K3RDeZPRvzkbU0xfpecQEtNP7LN8fip6sCvsT
// SIG // J0Ct5PnhqX9GuwdgR2VgQE6wQuxO7bN2edgKNAltHIAx
// SIG // H+IOVN3lofvlRxCtZJj/UBYufL8FIXrilUEnacOTj5XJ
// SIG // jdibIa4NXJzwoq6GaIMMai27dmsAHZat8hZ79haDJLmI
// SIG // z2qoRzEvmtzjcT3XAH5iR9HOiMm4GPoOco3Boz2vAkBq
// SIG // /2mbluIQqBC0N1AI1sM9MIIGBzCCA++gAwIBAgIKYRZo
// SIG // NAAAAAAAHDANBgkqhkiG9w0BAQUFADBfMRMwEQYKCZIm
// SIG // iZPyLGQBGRYDY29tMRkwFwYKCZImiZPyLGQBGRYJbWlj
// SIG // cm9zb2Z0MS0wKwYDVQQDEyRNaWNyb3NvZnQgUm9vdCBD
// SIG // ZXJ0aWZpY2F0ZSBBdXRob3JpdHkwHhcNMDcwNDAzMTI1
// SIG // MzA5WhcNMjEwNDAzMTMwMzA5WjB3MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSEwHwYDVQQDExhNaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
// SIG // ggEKAoIBAQCfoWyx39tIkip8ay4Z4b3i48WZUSNQrc7d
// SIG // GE4kD+7Rp9FMrXQwIBHrB9VUlRVJlBtCkq6YXDAm2gBr
// SIG // 6Hu97IkHD/cOBJjwicwfyzMkh53y9GccLPx754gd6udO
// SIG // o6HBI1PKjfpFzwnQXq/QsEIEovmmbJNn1yjcRlOwhtDl
// SIG // KEYuJ6yGT1VSDOQDLPtqkJAwbofzWTCd+n7Wl7PoIZd+
// SIG // +NIT8wi3U21StEWQn0gASkdmEScpZqiX5NMGgUqi+YSn
// SIG // EUcUCYKfhO1VeP4Bmh1QCIUAEDBG7bfeI0a7xC1Un68e
// SIG // eEExd8yb3zuDk6FhArUdDbH895uyAc4iS1T/+QXDwiAL
// SIG // AgMBAAGjggGrMIIBpzAPBgNVHRMBAf8EBTADAQH/MB0G
// SIG // A1UdDgQWBBQjNPjZUkZwCu1A+3b7syuwwzWzDzALBgNV
// SIG // HQ8EBAMCAYYwEAYJKwYBBAGCNxUBBAMCAQAwgZgGA1Ud
// SIG // IwSBkDCBjYAUDqyCYEBWJ5flJRP8KuEKU5VZ5KShY6Rh
// SIG // MF8xEzARBgoJkiaJk/IsZAEZFgNjb20xGTAXBgoJkiaJ
// SIG // k/IsZAEZFgltaWNyb3NvZnQxLTArBgNVBAMTJE1pY3Jv
// SIG // c29mdCBSb290IENlcnRpZmljYXRlIEF1dGhvcml0eYIQ
// SIG // ea0WoUqgpa1Mc1j0BxMuZTBQBgNVHR8ESTBHMEWgQ6BB
// SIG // hj9odHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2Ny
// SIG // bC9wcm9kdWN0cy9taWNyb3NvZnRyb290Y2VydC5jcmww
// SIG // VAYIKwYBBQUHAQEESDBGMEQGCCsGAQUFBzAChjhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01p
// SIG // Y3Jvc29mdFJvb3RDZXJ0LmNydDATBgNVHSUEDDAKBggr
// SIG // BgEFBQcDCDANBgkqhkiG9w0BAQUFAAOCAgEAEJeKw1wD
// SIG // RDbd6bStd9vOeVFNAbEudHFbbQwTq86+e4+4LtQSooxt
// SIG // YrhXAstOIBNQmd16QOJXu69YmhzhHQGGrLt48ovQ7DsB
// SIG // 7uK+jwoFyI1I4vBTFd1Pq5Lk541q1YDB5pTyBi+FA+mR
// SIG // KiQicPv2/OR4mS4N9wficLwYTp2OawpylbihOZxnLcVR
// SIG // DupiXD8WmIsgP+IHGjL5zDFKdjE9K3ILyOpwPf+FChPf
// SIG // wgphjvDXuBfrTot/xTUrXqO/67x9C0J71FNyIe4wyrt4
// SIG // ZVxbARcKFA7S2hSY9Ty5ZlizLS/n+YWGzFFW6J1wlGys
// SIG // OUzU9nm/qhh6YinvopspNAZ3GmLJPR5tH4LwC8csu89D
// SIG // s+X57H2146SodDW4TsVxIxImdgs8UoxxWkZDFLyzs7BN
// SIG // Z8ifQv+AeSGAnhUwZuhCEl4ayJ4iIdBD6Svpu/RIzCzU
// SIG // 2DKATCYqSCRfWupW76bemZ3KOm+9gSd0BhHudiG/m4LB
// SIG // J1S2sWo9iaF2YbRuoROmv6pH8BJv/YoybLL+31HIjCPJ
// SIG // Zr2dHYcSZAI9La9Zj7jkIeW1sMpjtHhUBdRBLlCslLCl
// SIG // eKuzoJZ1GtmShxN1Ii8yqAhuoFuMJb+g74TKIdbrHk/J
// SIG // mu5J4PcBZW+JC33Iacjmbuqnl84xKf8OxVtc2E0bodj6
// SIG // L54/LlUWa8kTo/0xggSlMIIEoQIBATCBkDB5MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSMwIQYDVQQDExpNaWNyb3NvZnQg
// SIG // Q29kZSBTaWduaW5nIFBDQQITMwAAALARrwqL0Duf3QAB
// SIG // AAAAsDAJBgUrDgMCGgUAoIG+MBkGCSqGSIb3DQEJAzEM
// SIG // BgorBgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgor
// SIG // BgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBQHlZ5M4rXs
// SIG // 4UAGxkaeoAqEarqrEzBeBgorBgEEAYI3AgEMMVAwTqAm
// SIG // gCQATQBpAGMAcgBvAHMAbwBmAHQAIABMAGUAYQByAG4A
// SIG // aQBuAGehJIAiaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L2xlYXJuaW5nIDANBgkqhkiG9w0BAQEFAASCAQCpF10q
// SIG // EH+4RjgAa6CbSOba2g0LEDlA1enc4WgoOEQVVLCW6eRp
// SIG // BT12gjCuCHRH6+O221zr+mnm6k16PDK4DGb5qVsnZI8g
// SIG // E/+WML357gUjv5FqCTOMj7YEwjYU8g91CM44HtsvtHmb
// SIG // Smy4kqKT9t4zP2tTemQpDVak5DvtWV0peZRenCr1PDfm
// SIG // gGYT67F+fxeazKMShLZPDRB7fjvb5Do/+T8rzCE/9ejI
// SIG // L9zklwFmsAvZJ8FkGyIbVjFGkJ54aXPHyNJqELAWhpeO
// SIG // nYyjOj1GHGBQpV8limyHKtVgCqxo2l5U+ypvqjYndSNi
// SIG // 0pvhRZbjfrY0Bm6SQMiYHQ0SOMX8oYICKDCCAiQGCSqG
// SIG // SIb3DQEJBjGCAhUwggIRAgEBMIGOMHcxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xITAfBgNVBAMTGE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQQITMwAAACs5MkjBsslI8wAAAAAAKzAJ
// SIG // BgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3
// SIG // DQEHATAcBgkqhkiG9w0BCQUxDxcNMTMwMzI3MTkxMjU4
// SIG // WjAjBgkqhkiG9w0BCQQxFgQUGE83ooat+1J6yFU/3upZ
// SIG // B0aGawYwDQYJKoZIhvcNAQEFBQAEggEATGSn+AivIFMY
// SIG // Der78OzvDeKPUnl0a3Wwv8Hs7FoEQtrimwJCX1pZVLU+
// SIG // Kg9G5OZlzvX0xItJY92pcxuf7lo5aLX1//nwOHleOYI9
// SIG // pn/7tD78+BuoZsxBR88ZDTfol8r2fOMssqS1r7uZwwi9
// SIG // pwKEVcvpmh9MT//GsVZYgukvPyFnKXLhq0idYN0ApMuz
// SIG // Ayqa1gjf4cYTTqQ6xao3u6iHrHNxL/GIUpdzEuIEggpm
// SIG // nLlr5TcIF9rRObJIj2kEuLG1f9hYCcAKx02CO2RHY5uC
// SIG // f29s67lTpz5dqmu/IDalBOg7evEnbM45Mih1Uiskxeyn
// SIG // p8PcL1IMfmF/M3kJfFoHIA==
// SIG // End signature block
