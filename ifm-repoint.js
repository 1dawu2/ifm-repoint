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
            this.resourceInfoStoryIsOptimized = false;
            this.resourceInfoStory = {};

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

        setStoryInfo(oData) {
            if (typeof oData != 'undefined' && oData) {
                Object.values(oData).forEach(
                    val => console.log(val)
                );

            }
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

                            // xhr.addEventListener("readystatechange", function () {
                            //     if (this.readyState === 4) {
                            //         console.log(this.responseText);
                            //         return JSON.stringify(this.responseText)
                            //     }
                            // });

                            xhr.open("POST", "/sap/fpa/services/rest/epm/contentlib?tenant=K");
                            xhr.setRequestHeader("x-csrf-token", FPA_CSRF_TOKEN);
                            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            xhr.setRequestHeader("Accept-Language", "en_GB");
                            xhr.onload = resolve;
                            xhr.onerror = reject;
                            xhr.send(data);
                        });
                    },

                    updateStory(resourceInfoStoryParentId, resourceInfoStoryType, resourceInfoStoryName, resourceInfoStoryDescription, resourceInfoStoryReplacedConn, storyID) {
                        var data = {
                            "action": "updateContent",
                            "data": {
                                "parentResId": resourceInfoStoryParentId,
                                "resourceType": resourceInfoStoryType,
                                "name": resourceInfoStoryName,
                                "description": resourceInfoStoryDescription,
                                "cdata": resourceInfoStoryReplacedConn,
                                "updateOpt": {
                                    "action": "updateStructure",
                                    "markForTranslation": false
                                },
                                "resourceId": storyID
                            }
                        };
                        var xhr = new XMLHttpRequest();
                        xhr.withCredentials = true;

                        xhr.addEventListener("readystatechange", function () {
                            if (this.readyState === 4) {
                                console.log(this.responseText);
                            }
                        });

                        xhr.open("POST", "/sap/fpa/services/rest/epm/contentlib?tenant=K");

                        // WARNING: Cookies will be stripped away by the browser before sending the request.
                        //xhr.setRequestHeader("Cookie", "s:IBGXzjjviOIwz7NyjNX4SLVj5bYswc5x.Ch8F1wvNx1dJ947DA5vfusaoar4Iow9XCZKCv0ez33w");
                        xhr.setRequestHeader("x-csrf-token", FPA_CSRF_TOKEN);
                        xhr.setRequestHeader("Content-Type", "application/json");

                        xhr.send(data);

                    },

                    getModelList(content) {
                        // The path to the entity collection differs between contentOptimized and "classic"
                        // Try both paths - give preference on optimized
                        let entityList = [];
                        let storyContentFound = false;
                        try {
                            // optimized path
                            entityList = content.cdata.contentOptimized.entities;
                            storyContentFound = true;
                            console.log("Story is content optimized.");
                            this.resourceInfoStoryIsOptimized = true;
                        } catch {
                            if (storyContentFound == false) {
                                try {
                                    // classic path
                                    entityList = content.cdata.content.entities;
                                    storyContentFound = true;
                                    console.log("Story is not content Optimized -> classic format.");
                                    this.resourceInfoStoryIsOptimized = false;
                                } catch {
                                    console.log("No Story Content Found.")
                                }
                            }
                        }
                        return entityList;
                    },

                    getDWCModelList(modelList) {
                        let DWCModelList = [];
                        for (let i = 0; i < modelList.length; i++) {
                            entity = modelList[i];
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
                        // console.log(DWCModelList);
                        return DWCModelList
                    },

                    replaceNameValueJSON(content, name, old_value, new_value) {

                        let name_str = JSON.stringify(name);
                        let old_value_str = JSON.stringify(old_value);
                        let new_value_str = JSON.stringify(new_value);
                        let search_str = name_str + ":" + old_value_str;
                        let replace_str = name_str + ":" + new_value_str;
                        console.log("JSON Search/replace: " + search_str + " replace by " + replace_str);

                        content = content.replaceAll(search_str, replace_str)
                        return content;
                    },

                    getStoryContent: async function (storyId) {
                        if (storyId) {
                            const statusesPromise = Promise.allSettled([
                                sap.fpa.ui.story.StoryFetcher.getContent(storyId)
                            ]);
                            // wait...
                            const statuses = await statusesPromise;
                            // after 1 second
                            console.log(statuses[0].value.cdata);
                            return statuses[0].value.cdata;
                        }
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
                                    // var oData = sap.ui.getCore().getModel().oData;
                                    // that_.updateList(oData);

                                    // this.getStoryInfo("179AF700C1F6054D4DB416C623EE5D2B").then(function (content) {
                                    //     var entities = this.getModelList(content);
                                    // }).catch(function (error) {
                                    //     console.log(error);
                                    // });

                                    const res = this.getStoryInfo("179AF700C1F6054D4DB416C623EE5D2B").then(function (e) {
                                        console.log(e.target.response);
                                    }, function (e) {
                                        // handle errors
                                    });


                                    this.getModelList(resp);



                                    // this.getStoryContent("179AF700C1F6054D4DB416C623EE5D2B").then(function (response) {
                                    //     var resourceInfoStory = JSON.stringify(response);
                                    //     var entities = this.getModelList(response);
                                    //     that_.setStoryInfo(oData);
                                    // }).catch(function (error) {
                                    //     console.log(error);
                                    // });

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