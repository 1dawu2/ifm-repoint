(function () {
    let _shadowRoot;
    let _id;
    let _list;

    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
        <style>
        </style>
        <div id="ui5_content" name="ui5_content">
         <slot name="content"></slot>
        </div>

        <script id="oView" name="oView" type="sapui5/xmlview">
            <mvc:View
			    controllerName="ifm.repoint"
				xmlns:l="sap.ui.layout"
				xmlns:mvc="sap.ui.core.mvc"
				xmlns="sap.m">
				<l:VerticalLayout
					class="sapUiContentPadding"
					width="100%">
					<l:content>
                        <Button
                            id="ifmListBtn"
                            class="sapUiTinyMarginBeginEnd"
                            icon="sap-icon://sort"
                            text="Sort List"
                            type="Default"
                            press="configList">
                        </Button>
					</l:content>
				</l:VerticalLayout>
			</mvc:View>
        </script>        
    `;

    class IFMRepoint extends HTMLElement {

        constructor() {
            super();

            _shadowRoot = this.attachShadow({
                mode: "open"
            });
            _shadowRoot.appendChild(tmpl.content.cloneNode(true));

            _id = createGuid();

            _shadowRoot.querySelector("#oView").id = _id + "_oView";

            this._export_settings = {};
            this._export_settings.list = {};
            this.storyID = '';
            this.resourceInfoStoryIsOptimized = false;
            this.resourceInfoStory = '';
            this.resourceInfoStoryReplacedConn = '';
            this.resourceInfoStoryName = '';
            this.resourceInfoStoryType = '';
            this.resourceInfoStoryParentId = '';
            this.resourceInfoStoryDescription = '';
            this.model_List_Count = 0;
            this.model_List_Processed = -1;
            this.model_List = '';
            this.dataSource = '';
            this.objectName = '';
            this.description = '';
            this.schemaName = '';
            this.connName = '';
            this.resourceId = '';
            this.parentSourceId = '';
            this.type = '';
            this.modelDefinition = '';
            jQuery.sap.declare("sap.fpa.ui.infra.model.service.ModelingServices");
            if (window.sap && sap.fpa && sap.fpa.ui && sap.fpa.ui.infra) {
                if (sap.fpa.ui.infra.common) {
                    this.context = sap.fpa.ui.infra.common.getContext();
                }
                if (sap.fpa.ui.infra.model) {
                    this.model = sap.fpa.ui.infra.model.service;
                }
            }
            // this.contentLibMgr = sap.fpa.ui.infra.common.service.ServiceManager.getSerivce("EPM/ObjectMgr"); //this.getService("EPM/ObjectMgr");

            loadthis(this);

            this.addEventListener("click", event => {
                console.log('click');
            });
        }

        // CONTROL FLOW
        updateList(oData) {
            console.log("oData update");
            console.log(oData);
            var sacList = [];
            if (typeof oData != 'undefined' && oData) {
                Object.values(oData).forEach(
                    val => sacList.push(val)
                );
                this._firePropertiesChanged(sacList);
            };
        }

        prepareListData(listItems, isListUpdate) {
            var sacList = { "listItems": [] };

            if (typeof listItems != 'undefined' && listItems) {
                Object.values(listItems).forEach(
                    val => sacList["listItems"].push(val)
                );
                if (isListUpdate === true) {
                    this.updateList(sacList["listItems"]);
                };
            };

            console.log("prepared list");
            console.log(sacList);

            return sacList
        }

        connectedCallback() {
            try {
                if (window.commonApp) {
                    let outlineContainer = commonApp.getShell().findElements(true, ele => ele.hasStyleClass && ele.hasStyleClass("sapAppBuildingOutline"))[0]; // sId: "__container0"

                    if (outlineContainer && outlineContainer.getReactProps) {
                        let parseReactState = state => {
                            let components = {};

                            let globalState = state.globalState;
                            let instances = globalState.instances;
                            let app = instances.app["[{\"app\":\"MAIN_APPLICATION\"}]"];
                            let names = app.names;

                            for (let key in names) {
                                let name = names[key];

                                let obj = JSON.parse(key).pop();
                                let type = Object.keys(obj)[0];
                                let id = obj[type];

                                components[id] = {
                                    type: type,
                                    name: name
                                };
                            }

                            for (let componentId in components) {
                                let component = components[componentId];
                            }

                            let metadata = JSON.stringify({
                                components: components,
                                vars: app.globalVars
                            });

                            if (metadata != this.metadata) {
                                this.metadata = metadata;

                                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                                    detail: {
                                        properties: {
                                            metadata: metadata
                                        }
                                    }
                                }));
                            }
                        };

                        let subscribeReactStore = store => {
                            this._subscription = store.subscribe({
                                effect: state => {
                                    parseReactState(state);
                                    return {
                                        result: 1
                                    };
                                }
                            });
                        };

                        let props = outlineContainer.getReactProps();
                        if (props) {
                            subscribeReactStore(props.store);
                        } else {
                            let oldRenderReactComponent = outlineContainer.renderReactComponent;
                            outlineContainer.renderReactComponent = e => {
                                let props = outlineContainer.getReactProps();
                                subscribeReactStore(props.store);

                                oldRenderReactComponent.call(outlineContainer, e);
                            }
                        }
                    }
                }
            } catch (e) { }
        }

        disconnectedCallback() {
            if (this._subscription) {
                this._subscription();
                this._subscription = null;
            }
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            if ("designMode" in changedProperties) {
                this._designMode = changedProperties["designMode"];
            }
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            // loadthis(this);
            if ("list" in changedProperties) {
                this._export_settings.list = changedProperties["list"];
            }
        }

        _firePropertiesChanged(value) {
            this._export_settings.list = value;
            console.log("property change");
            console.log(this._export_settings.list);
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        list: value
                    }
                }
            }));
        }

        // SETTINGS
        get list() {
            return this._export_settings.list;
        }
        set list(value) {
            value = _list;
            this._export_settings.list = value;
        }

        static get observedAttributes() {
            return [
                "list"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }

    }
    customElements.define("ifm-repoint", IFMRepoint);

    // UTILS
    function loadthis(that) {
        var that_ = that;
        console.log("properties start loadthis");
        // console.log(changedProperties);

        let content = document.createElement('div');
        content.slot = "content";
        that_.appendChild(content);

        sap.ui.getCore().attachInit(function () {
            "use strict";

            //### Controller ###
            sap.ui.define([
                "jquery.sap.global",
                "sap/f/Card",
                "sap/ui/core/dnd/DragInfo",
                "sap/ui/core/dnd/DropInfo",
                "sap/ui/core/mvc/Controller"
            ], function (jQuery, Controller) {
                "use strict";

                return Controller.extend("ifm.repoint", {

                    getStoryInfo(storyID) {
                        return new Promise(function (resolve, reject) {
                            var data = JSON.stringify({
                                "action": "getResourceEx",
                                "data": {
                                    "resourceId": storyID,
                                    "metadata": {
                                        "name": true,
                                        "description": true,
                                        "access": true,
                                        "userAuthOnly": true,
                                        "ancestorPath": {
                                            "name": true,
                                            "access": true,
                                            "description": true,
                                            "ownerType": true,
                                            "parentResId": true,
                                            "spaceId": true
                                        },
                                        "resourceType": true,
                                        "packageId": true,
                                        "createdBy": true,
                                        "modifiedBy": true,
                                        "updateCounter": true,
                                        "createdTime": true,
                                        "modifiedTime": true,
                                        "epmObjectData": {
                                            "includeDependencies": false,
                                            "includeSubItems": true,
                                            "options": {}
                                        },
                                        "spaceId": true
                                    }
                                }
                            });
                            var xhr = new XMLHttpRequest();
                            xhr.open("POST", "/sap/fpa/services/rest/epm/contentlib?tenant=K");
                            xhr.setRequestHeader("x-csrf-token", FPA_CSRF_TOKEN);
                            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            xhr.setRequestHeader("Accept-Language", "en_GB");
                            xhr.onload = resolve;
                            xhr.onerror = reject;
                            xhr.send(data);
                        });
                    },

                    getStoryContent(modelID) {
                        return new Promise(function (resolve, reject) {
                            var data = JSON.stringify({
                                "action": "getContent",
                                "data": {
                                    "resourceId": that_.modelID,
                                    "oOpt": {
                                        "getSourceResource": true,
                                        "propertyBag": true,
                                        "includeAncestorInfo": true,
                                        "fetchDisplayName": true
                                    }
                                }
                            });
                            var xhr = new XMLHttpRequest();
                            xhr.open("POST", "/sap/fpa/services/rest/epm/contentlib?tenant=K");
                            xhr.setRequestHeader("x-csrf-token", FPA_CSRF_TOKEN);
                            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            xhr.setRequestHeader("Accept-Language", "en_GB");
                            xhr.onload = resolve;
                            xhr.onerror = reject;
                            xhr.send(data);
                        });
                    },

                    onInit: function (oEvent) {
                    },

                    configList: function (oEvent) {
                        // if (!this.oDefaultDialog) {
                        var modelList = new sap.ui.model.json.JSONModel();
                        modelList.setData(that_.prepareListData(that_.list, false));
                        sap.ui.getCore().setModel(modelList);

                        var ui5List = new sap.m.List({
                            items: {
                                path: "/listItems",
                                template: new sap.m.StandardListItem({
                                    title: "{key}",
                                    info: "{old_value}",
                                    description: "{new_value}"
                                })
                            }
                        });
                        var ui5Card = new sap.f.Card({
                            content: [ui5List]
                        });
                        var ui5ScrollContainer = new sap.m.ScrollContainer({
                            height: "100%",
                            width: "100%",
                            content: [ui5Card]
                        });
                        this.oDefaultDialog = new sap.m.Dialog({
                            contentWidth: "100%",
                            contentHeight: "100%",
                            title: "Settings",
                            content: [ui5ScrollContainer],
                            beginButton: new sap.m.Button({
                                text: "OK",
                                press: function () {

                                    function updateStory(resourceInfoStoryParentId, resourceInfoStoryType, resourceInfoStoryName, resourceInfoStoryDescription, resourceInfoStoryReplacedConn, storyID) {
                                        return new Promise(function (resolve, reject) {
                                            var data = JSON.stringify({
                                                "action": "updateContent",
                                                "data": {
                                                    "cdata": resourceInfoStoryReplacedConn,
                                                    "description": resourceInfoStoryDescription,
                                                    "name": resourceInfoStoryName,
                                                    "resourceId": storyID,
                                                    "fetchOpt": {
                                                        "bIncDependency": false,
                                                        "bIncSubItems": false
                                                    },
                                                    // "mobileSupport": 0,
                                                    // "name": resourceInfoStoryName,
                                                    // "resourceId": storyID,
                                                    // "parentResId": resourceInfoStoryParentId,
                                                    // "resourceType": "CUBE", //resourceInfoStoryType,
                                                    // "updateOpt": {
                                                    //     "action": "updateStructure",
                                                    //     "markForTranslation": false
                                                    // },
                                                    "mobileSupport": 0,
                                                    "updateOpt": {
                                                        "dataChangeInsightsSupport": {
                                                            "value": 0
                                                        },
                                                        "enhancedProperties": {
                                                            "STORY_OPTIMIZED_INFO": "VIEW_EDIT_STORY2"
                                                        },
                                                        "contentOnly": true,
                                                        "ignoreVersion": false,
                                                    },
                                                }
                                            });

                                            // l.getInstance = function () {
                                            //     let e = new l;
                                            //     return e.oManager = a.getService("EPM/ObjectMgr"),
                                            //         e.oSecurityManager = a.getService("EPM/Security"),
                                            //         e.oModelUtil = a.getService("fpa.modelUtil"),
                                            //         e.oModel = a.getService("fpa.model"),
                                            //         e.oDimension = a.getService("fpa.dimension"),
                                            //         e.oMember = a.getService("fpa.Member"),
                                            //         e.oContentLibManager = a.getService("EPM/Contentlib"),
                                            //         l._instance = e,
                                            //         e
                                            // }

                                            // l.prototype.model_update = function(e, t, i, r, o) {
                                            //     if (o = o || {
                                            //         action: "updateStructure"
                                            //     },
                                            //         e.translation) {
                                            //         let t = !!e.translation.enabled;
                                            //         o.markForTranslation = t,
                                            //             t && (o.origLangu = e.translation.originalLanguage)
                                            //     }
                                            //     o.localVer = t;
                                            //     let a = {
                                            //         parentResId: e.parentResourceId,
                                            //         resourceType: "CUBE",
                                            //         name: e.shortDescription,
                                            //         description: e.description || "",
                                            //         cdata: JSON.stringify(e),
                                            //         updateOpt: o,
                                            //         resourceId: e.id
                                            //     };
                                            //     return this.oContentLibManager.callMethod("updateContent", a, !0, function (e) {
                                            //         n.getContext().postNotification("onModelChange"),
                                            //             i(e)
                                            //     }, r)

                                            // resourceId: e.name, <- story id
                                            //     cdata: JSON.stringify(n),
                                            //         updateOpt: m, < contentOnly = true
                                            //             mobileSupport: r,
                                            //                 fetchOpt: {
                                            //     bIncDependency: !1,
                                            //         bIncSubItems: !1
                                            // }

                                            var xhr = new XMLHttpRequest();
                                            xhr.open("POST", "/sap/fpa/services/rest/epm/contentlib?tenant=K");
                                            xhr.setRequestHeader("x-csrf-token", FPA_CSRF_TOKEN);
                                            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                                            xhr.setRequestHeader("Accept-Language", "en_GB");
                                            xhr.onload = resolve;
                                            xhr.onerror = reject;
                                            xhr.send(data);
                                        });
                                    };

                                    function replaceNameValueJSON(content, name, old_value, new_value) {

                                        let name_str = JSON.stringify(name);
                                        let old_value_str = JSON.stringify(old_value);
                                        let new_value_str = JSON.stringify(new_value);
                                        let search_str = name_str + ":" + old_value_str;
                                        let replace_str = name_str + ":" + new_value_str;
                                        console.log("JSON Search/replace: " + search_str + " replace by " + replace_str);

                                        content = content.replaceAll(search_str, replace_str)
                                        return content;
                                    };

                                    function replacementCheck(content, old_value) {
                                        let backQuote = String.fromCharCode(92) + '"';
                                        let old_value_backQuote = backQuote + old_value + backQuote;
                                        let position_backQuote = content.search(old_value_backQuote);

                                        let old_value_stringify = JSON.stringify(old_value);
                                        let position_stringify = content.search(old_value_stringify);

                                        let position = -1;
                                        if (position_stringify != -1) { position = position_stringify; };
                                        if (position_backQuote != -1) { position = position_backQuote; };

                                        if (position != -1) {
                                            console.log("JSON Search/Replace: Attention - Old pattern still found after replacement! Revisit finding!");
                                            console.log("JSON Search/Replace: Context Snipped of first occurence: [...] " + content.substring(position - 30, position + old_value.length + 1)) + " [...]";
                                        } else {
                                            console.log("JSON Search/Replace: All occurences of " + old_value_stringify + " and " + old_value_backQuote + " have been replaced.");
                                        }
                                        return position;
                                    };

                                    var content = {};
                                    that_.storyID = that_._export_settings.list[2]['old_value'];
                                    var res = this.getStoryInfo(that_.storyID).then(function (e) {
                                        content = JSON.parse(e.target.response);

                                        let entityList = [];
                                        let storyContentFound = false;
                                        try {
                                            // set attributes
                                            that_.resourceInfoStory = JSON.stringify(content.data.cdata);
                                            that_.resourceInfoStoryName = content.name;
                                            that_.resourceInfoStoryType = content.resourceType;
                                            if (content.metadata.parentId) {
                                                that_.resourceInfoStoryParentId = content.metadata.parentId.name;
                                            } else {
                                                that_.resourceInfoStoryParentId = that_.storyID;
                                            }
                                            that_.resourceInfoStoryDescription = content.metadata.description;
                                            entityList = content.data.cdata.contentOptimized.entities;
                                            storyContentFound = true;
                                            console.log("Story is content optimized.");
                                            that_.resourceInfoStoryIsOptimized = true;
                                        } catch {
                                            if (storyContentFound == false) {
                                                try {
                                                    // classic path
                                                    entityList = content.data.cdata.content.entities;
                                                    storyContentFound = true;
                                                    console.log("Story is not content Optimized -> classic format.");
                                                    that_.resourceInfoStoryIsOptimized = false;
                                                } catch {
                                                    console.log("No Story Content Found.")
                                                }
                                            }
                                        }

                                        let DWCModelList = [];
                                        for (let i = 0; i < entityList.length; i++) {
                                            var entity = entityList[i];
                                            // filter for DWC models
                                            if (entity.type == "dataset") {
                                                // console.log(entity.data);
                                                // let entityName = entity.data.metadata.id.name;
                                                let entityName = entity.data.modelId;
                                                let entityDescription = entity.data.metadata?.description;
                                                if (entityDescription)
                                                    DWCModelList.push(JSON.stringify(entityName));
                                                console.log("Models: Found resourceId: " + entityName + " Name: " + entityDescription)
                                            }
                                        }
                                        console.log(DWCModelList);
                                        that_.model_List_Count = DWCModelList.length;
                                        that_.model_List_Processed = -1;
                                        that_.model_List = JSON.stringify(DWCModelList);

                                        let backslash = String.fromCharCode(92);
                                        let backQuote = backslash + '"';

                                        // handle connection change
                                        let old_connection = that_._export_settings.list[1]['old_value'];
                                        let new_connection = that_._export_settings.list[1]['new_value'];
                                        if (old_connection != new_connection) {
                                            console.log("Connection replacement starts ------------------");
                                            that_.resourceInfoStory = replaceNameValueJSON(resourceInfoStory, "systemName", old_connection, new_connection);
                                            that_.resourceInfoStory = replaceNameValueJSON(resourceInfoStory, "connectionName", old_connection, new_connection);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "System", old_connection, new_connection);

                                            let old_ff_system = backQuote + "System" + backQuote + ":" + backQuote + old_connection + backQuote;
                                            let new_ff_system = backQuote + "System" + backQuote + ":" + backQuote + new_connection + backQuote;
                                            console.log("JSON Search/replace: " + old_ff_system + " replace by " + new_ff_system);
                                            that_.resourceInfoStory = that_.resourceInfoStory.replaceAll(old_ff_system, new_ff_system);

                                            let old_uqm_system = JSON.stringify("uqmRemoteSystemNames") + ":[" + JSON.stringify(old_connection);
                                            let new_uqm_system = JSON.stringify("uqmRemoteSystemNames") + ":[" + JSON.stringify(new_connection);
                                            console.log("JSON Search/replace: " + old_uqm_system + " replace by " + new_uqm_system);
                                            that_.resourceInfoStory = that_.resourceInfoStory.replaceAll(old_uqm_system, new_uqm_system);

                                            // Is there an additional name-value pattern for connection or just a false positive finding?
                                            let position = replacementCheck(that_.resourceInfoStory, old_connection);
                                        } else {
                                            console.log("Connection replacement skipped for story as old and new name are the same.");
                                        }

                                        // handle space change
                                        let old_space = that_._export_settings.list[0]['old_value'];
                                        let new_space = that_._export_settings.list[0]['new_value'];

                                        if (old_space != new_space) {
                                            console.log("Space replacement starts ------------------");
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "remoteSchemaName", old_space, new_space);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "schemaName", old_space, new_space);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "SchemaName", old_space, new_space);

                                            let old_inamodel = "inamodel:[" + old_space;
                                            let new_inamodel = "inamodel:[" + new_space;
                                            that_.resourceInfoStory = that_.resourceInfoStory.replaceAll(old_inamodel, new_inamodel);

                                            let old_ff_query = backQuote + "SchemaName" + backQuote + ":" + backQuote + old_space + backQuote;
                                            let new_ff_query = backQuote + "SchemaName" + backQuote + ":" + backQuote + new_space + backQuote;
                                            that_.resourceInfoStory = that_.resourceInfoStory.replaceAll(old_ff_query, new_ff_query);

                                            // Is there an additional name-value pattern for space or just a false positive finding?
                                            let position = replacementCheck(that_.resourceInfoStory, old_space);
                                        } else {
                                            console.log("Space replacement skipped for story as old and new name are the same.")
                                        }

                                        // handle model change
                                        let old_model = that_._export_settings.list[3]['old_value'];
                                        let new_model = that_._export_settings.list[3]['new_value'];

                                        if (old_model != new_model) {
                                            console.log("DWC Model replacement starts ------------------")
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "name", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "description", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "shortDescription", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "objectName", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "ObjectName", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "displayName", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "en", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "en_UK", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "remoteObjectName", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "datasetName", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "datasetDescription", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "modelName", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "sourceDescription", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "title", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "text", old_model, new_model);
                                            that_.resourceInfoStory = replaceNameValueJSON(that_.resourceInfoStory, "titleDom", old_model, new_model);

                                            // Is there an additional name-value pattern for connection or just a false positive finding?
                                            let position = replacementCheck(that_.resourceInfoStory, old_model);
                                        }
                                        else {
                                            console.log("Model replacement skipped for story as old and new name are the same.")
                                        }

                                        // set the replaced connection information
                                        that_.resourceInfoStoryReplacedConn = JSON.stringify(that_.resourceInfoStory);

                                        updateStory(that_.resourceInfoStoryParentId, that_.resourceInfoStoryType, that_.resourceInfoStoryName, that_.resourceInfoStoryDescription, that_.resourceInfoStoryReplacedConn, that_.storyID);


                                    }, function (e) {
                                        // handle errors
                                    });


                                    // get story content and exchange the model information
                                    var mod = this.getStoryContent(that_.model_List).then(function (e) {
                                        content = JSON.parse(e.target.response);
                                        that_.modelDefinition = JSON.stringify(content.data.cdata);
                                        that_.dataSource = content.data.cdata.sources[0];
                                        that_.objectName = that_.dataSource.objectName;
                                        that_.description = content.description;
                                        that_.schemaName = JSON.stringify(that_.dataSource.schemaName);
                                        that_.resourceId = content.resourceId;
                                        that_.parentSourceId = content.parentResId;
                                        that_.type = content.resourceType;

                                        // change space for model defintion
                                        if (old_space != new_space) {
                                            console.log("Space replacement starts ------------------")
                                            modelDefinition = replaceNameValueJSON(that_.modelDefinition, "schemaName", old_space, new_space);
                                            modelDefinition = replaceNameValueJSON(that_.modelDefinition, "SchemaName", old_space, new_space);
                                            // Is there an additional name-value pattern for connection or just a false positive finding?
                                            let position = that_.replacementCheck(that_.modelDefinition, old_space);
                                        }


                                        if (old_name != new_name) {
                                            console.log("Connection replacement starts ------------------")
                                            modelDefinition = replaceNameValueJSON(modelDefinition, "connectionName", old_name, new_name);
                                            modelDefinition = replaceNameValueJSON(modelDefinition, "System", old_name, new_name);
                                            // Is there an additional name-value pattern for connection or just a false positive finding?
                                            let position = replacementCheck(modelDefinition, old_name);
                                        }

                                        if (old_model != new_model && old_model == objectName) {
                                            console.log("DWC Model replacement starts ------------------")
                                            modelDefinition = replaceNameValueJSON(modelDefinition, "name", old_model, new_model);
                                            modelDefinition = replaceNameValueJSON(modelDefinition, "description", old_model, new_model);
                                            modelDefinition = replaceNameValueJSON(modelDefinition, "objectName", old_model, new_model);
                                            modelDefinition = replaceNameValueJSON(modelDefinition, "ObjectName", old_model, new_model);
                                            modelDefinition = replaceNameValueJSON(modelDefinition, "displayName", old_model, new_model);
                                            modelDefinition = replaceNameValueJSON(modelDefinition, "en", old_model, new_model);
                                            modelDefinition = replaceNameValueJSON(modelDefinition, "en_UK", old_model, new_model);
                                            // Is there an additional name-value pattern for connection or just a false positive finding?
                                            let position = replacementCheck(modelDefinition, old_model);
                                        }

                                    }, function (e) {
                                        // handle errors
                                    });




                                    this.oDefaultDialog.close();
                                    // show message

                                }.bind(this)
                            })
                        });
                        // };
                        this.oDefaultDialog.open();
                    }
                });
            });

            //### THE APP: place the XMLView somewhere into DOM ###
            var oView = sap.ui.xmlview({
                viewContent: jQuery(_shadowRoot.getElementById(_id + "_oView")).html(),
            });
            oView.placeAt(content);


            if (that_._designMode) {
                console.log("Design Mode");
            }
        });
    }

    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
})();