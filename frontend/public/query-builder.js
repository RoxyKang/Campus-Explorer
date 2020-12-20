/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
const coursesField = ["avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"];
const roomsField = ["lat", "lon", "seats", "fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

const mfield = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];

CampusExplorer.buildQuery = () => {
    let activeHTML = document.getElementsByClassName("tab-panel active")[0];
    let id = activeHTML.getElementsByTagName("form")[0].getAttribute('data-type');
    let field = [];

    if (id === "courses") {
        field = coursesField;
    } else {
        field = roomsField;
    }

    let query = {};
    let bodyHTML = activeHTML.getElementsByClassName("form-group conditions")[0];
    let columnsHTML = activeHTML.getElementsByClassName("form-group columns")[0];
    let orderHTML = activeHTML.getElementsByClassName("form-group order")[0];
    let groupsHTML = activeHTML.getElementsByClassName("form-group groups")[0];
    let transHTML = activeHTML.getElementsByClassName("form-group transformations")[0];

    let bodyQuery = this.buildBody(bodyHTML, id);
    let columnQuery = this.buildColumns(columnsHTML, id, field);
    let orderQuery = this.buildOrder(orderHTML, id, field);
    let groupsQuery = this.buildGroups(groupsHTML, id);
    let applyQuery = this.buildTrans(transHTML, id);

    query["WHERE"] = bodyQuery;

    let optionsQuery = {};
    optionsQuery["COLUMNS"] = columnQuery;
    if (typeof orderQuery === "string") {
        optionsQuery["ORDER"] = orderQuery;
    }else if (Object.keys(orderQuery).length > 0) {
        optionsQuery["ORDER"] = orderQuery;
    }
    query["OPTIONS"] = optionsQuery;

    let transQuery = {};
    if (groupsQuery.length > 0) {
        transQuery["GROUP"] = groupsQuery;
    }

    if (applyQuery.length > 0) {
        transQuery["APPLY"] = applyQuery;
    }
    if (Object.keys(transQuery).length > 0) {
        query["TRANSFORMATIONS"] = transQuery;
    }

    return query;
};

buildBody = (bodyHTML, id) => {
    let bodyQuery = {};
    let conditionType = bodyHTML.getElementsByClassName("control-group condition-type")[0];

    let logic = "";
    if (conditionType.getElementsByClassName("control conditions-all-radio")[0].getElementsByTagName("input")[0].checked) {
        logic = "AND";
    } else if (conditionType.getElementsByClassName("control conditions-any-radio")[0].getElementsByTagName("input")[0].checked) {
        logic = "OR";
    } else {
        logic = "NOT";
    }

    let allConditions = bodyHTML.getElementsByClassName("control-group condition");
    let allSubLogics = [];

    for (const condition of allConditions) {
        let hasNot = condition.getElementsByClassName("control not")[0].getElementsByTagName("input")[0].checked;

        let fields = condition.getElementsByClassName("control fields")[0].getElementsByTagName("select")[0];
        let selectedField = "";
        let fieldName = "";
        for (const item of fields) {
            if (item.selected) {
                fieldName = item.value;
                selectedField = id.concat("_"+fieldName);
            }
        }

        let operators = condition.getElementsByClassName("control operators")[0].getElementsByTagName("select")[0];
        let selectedOperator = "";
        for (const item of operators) {
            if (item.selected) {
                selectedOperator = item.value;
            }
        }

        let value = condition.getElementsByClassName("control term")[0].getElementsByTagName("input")[0].value;
        if (mfield.includes(fieldName)) {
            if (value){
                value = value*1;
            }
        }

        let subLogic = {};
        if (hasNot) {
            subLogic["NOT"] = {[selectedOperator]: {[selectedField]: value}};
        } else {
            subLogic[selectedOperator] = {[selectedField]: value};
        }

        allSubLogics.push(subLogic);
    }

    if (allSubLogics.length === 0) {
        bodyQuery = {};
    } else if (allSubLogics.length === 1) {
        bodyQuery = allSubLogics[0];
    } else {
        if (logic === "AND") {
            bodyQuery = {"AND": allSubLogics};
        } else if (logic === "OR") {
            bodyQuery = {"OR": allSubLogics};
        } else {
            bodyQuery = {"NOT": {"OR": allSubLogics}};
        }
    }

    return bodyQuery;
}

buildColumns = (columnsHTML, id, field) => {
    let fields = columnsHTML.getElementsByClassName("control field");
    let transFields = columnsHTML.getElementsByClassName("control transformation");
    let selectedColumns = [];

    for (const item of fields) {
        let input = item.getElementsByTagName("input")[0];
        if (input.checked) {
            let columnVal = "";
            if (field.includes(input.value)) {
                columnVal = id.concat("_"+input.value);
            } else {
                columnVal = input.value;
            }
            selectedColumns.push(columnVal);
        }
    }

    for (const item of transFields) {
        let input = item.getElementsByTagName("input")[0];
        if (input.checked) {
            selectedColumns.push(input.value);
        }
    }

    return selectedColumns;
}

buildOrder = (orderHTML, id, field) => {
    let orderQuery = {};
    let dirHTML = orderHTML.getElementsByClassName("control descending")[0];
    let fields = orderHTML.getElementsByClassName("control order fields")[0].getElementsByTagName("option");

    let dir = "";
    if (dirHTML.getElementsByTagName("input")[0].checked) {
        dir = "DOWN";
    } else {
        dir = "UP";
    }

    let selectedOrderKey = [];
    for (const option of fields) {
        if (option.selected) {
            let orderVal = "";
            if (field.includes(option.value)) {
                orderVal = id.concat("_"+option.value);
            } else {
                orderVal = option.value;
            }
            selectedOrderKey.push(orderVal);
        }
    }
    if (selectedOrderKey.length === 0) {
        return orderQuery;
    }else if (dir === "UP" && selectedOrderKey.length === 1) {
        orderQuery = selectedOrderKey[0];
    } else {
        orderQuery["dir"] = dir;
        orderQuery["keys"] = selectedOrderKey;
    }

    return orderQuery;
}

buildGroups = (groupsHTML, id) => {
    let fields = groupsHTML.getElementsByClassName("control field");
    let selectedGroups = [];

    for (const item of fields) {
        let input = item.getElementsByTagName("input")[0];
        if (input.checked) {
            selectedGroups.push(id.concat("_"+input.value));
        }
    }

    return selectedGroups;
}

buildTrans = (transHTML, id) => {
    let applyRules = [];
    let transRules = transHTML.getElementsByClassName("control-group transformation");

    if (transRules.length === 0) {
        return applyRules;
    }

    for (const item of transRules) {
        let applykey = item.getElementsByClassName("control term")[0].getElementsByTagName("input")[0].value;

        let applytoken = "";
        let operators = item.getElementsByClassName("control operators")[0].getElementsByTagName("select")[0].getElementsByTagName("option");
        for (const token of operators) {
            if (token.selected) {
                applytoken = token.value;
                break;
            }
        }

        let appliedField = "";
        let allFields = item.getElementsByClassName("control fields")[0].getElementsByTagName("select")[0].getElementsByTagName("option");
        for (const field of allFields) {
            if (field.selected) {
                appliedField = id.concat("_"+field.value);
            }
        }

        let rule = {};
        rule[applykey] = {[applytoken]: appliedField};
        applyRules.push(rule);
    }

    return applyRules;
}
