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
            this.storyVersion = '';
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
                if (sap.fpa.ui.infra.service) {
                    this.model = sap.fpa.ui.infra.model.service.ServiceProxy(this._context);
                }
                if (sap.fpa.ui.story.Utils) {
                    this.contentLib = sap.fpa.ui.story.Utils.getContentLibService();
                }
            }
            // this.contentLibMgr = sap.fpa.ui.infra.common.service.ServiceManager.getSerivce("EPM/ObjectMgr"); //this.getService("EPM/ObjectMgr");

            loadthis(this);

            this.addEventListener("click", event => {
                console.log('click');
            });
        }

        getInstanc() {
            jQuery.sap.declare("sap.fpa.ui.infra.model.service.ModelingServices");
            let n = i(33)
                , r = i(6)
                , o = i(2462)
                , a = i(179)
                , s = i(181)
                , l = function () { };
            l.getInstance = function () {
                let e = new l;
                return e.oManager = a.getService("EPM/ObjectMgr"),
                    e.oSecurityManager = a.getService("EPM/Security"),
                    e.oModelUtil = a.getService("fpa.modelUtil"),
                    e.oModel = a.getService("fpa.model"),
                    e.oDimension = a.getService("fpa.dimension"),
                    e.oMember = a.getService("fpa.Member"),
                    e.oContentLibManager = a.getService("EPM/Contentlib"),
                    l._instance = e,
                    e
            }
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


                    updateContent(storyID) {
                        return new Promise(function (resolve, reject) {
                            var data = JSON.stringify(
                                {
                                    "action": "updateContent",
                                    "data": {
                                        "resourceId": "179AF700C1F6054D4DB416C623EE5D2B",
                                        "name": "DSP_CHANGE_CONNECTION",
                                        "description": "DSP_CHANGE_CONNECTION",
                                        "cdata": "{\"version\":\"4.6\",\"entities\":[{\"id\":\"6e8b7961-9994-4bfd-bce6-e1ace133f6f5\",\"name\":\"New Infographic\",\"type\":\"story\",\"data\":{\"id\":\"6f4a624a-57dd-4707-a67b-38a93ce19b16\",\"title\":\"New Infographic\",\"pages\":[{\"title\":\"Page_1\",\"hidden\":false,\"content\":{\"version\":\"2.0\",\"layouts\":[{\"id\":\"boxlayout\",\"definition\":{\"type\":\"sap.lumira.story.layout.unified\",\"page\":{\"sections\":[{\"sectionId\":\"26428043-0874-4158-8806-958617513150\",\"definition\":{\"x\":0,\"y\":0,\"width\":886,\"height\":384,\"title\":\"Section\"},\"widgets\":[{\"widgetId\":\"93251686-6387-4321-8359-330671083228\",\"definition\":{\"removeable\":true,\"x\":0,\"y\":0,\"height\":384,\"width\":886}}]}],\"definition\":{\"backgroundColor\":\"#FFFFFF\",\"type\":\"CANVAS\",\"height\":681,\"width\":886}}}}],\"widgets\":[{\"id\":\"93251686-6387-4321-8359-330671083228\",\"class\":\"sap.fpa.ui.story.entity.dynamictable.DynamicTableWidget\",\"definition\":{\"entityId\":\"fb42da96-2d4a-4874-9c49-7b8a190994e6\",\"content\":{\"dataSource\":{\"cubeId\":\"CUBE:t.K.Cum09400ha9q67vbn8c0o13soj:Cum09400ha9q67vbn8c0o13soj\",\"packageName\":\"t.K.Cum09400ha9q67vbn8c0o13soj\",\"queryId\":\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\",\"isRemote\":true,\"systemName\":\"DWCLive\",\"remoteObjectType\":\"InAModel\",\"remoteObjectName\":\"Rchling_Analytical_Model\",\"remotePackageName\":\"\",\"remoteSchemaName\":\"BU_SINGER\",\"name\":\"Cum09400ha9q67vbn8c0o13soj\",\"shortDescription\":\"Rchling_Analytical_Model3\",\"description\":\"Rchling_Analytical_Model3\"}},\"canCreateStoryFromWidget\":false,\"autoJoinWidgetGroup\":true,\"themeOverrideSettings\":{\"backgroundColor\":\"\",\"border\":{\"format\":\"none\",\"style\":\"solid\",\"color\":\"rgb(88,89,91)\",\"thickness\":1,\"radius\":0},\"font\":{\"color\":\"rgb(88, 89, 91)\",\"family\":\"\"},\"responsiveness\":true,\"stylingTemplate\":\"tablestyle\",\"thresholdStyle\":0},\"measureDimensionConfig\":{\"measures\":[],\"dimensions\":[],\"crossCalculations\":[],\"enable\":false,\"allMeasures\":true,\"allDimensions\":true,\"allCrossCalculations\":true,\"showUsedDimensionsInExplorer\":true}},\"themeClasses\":[],\"dimension\":null,\"serviceValidationHashes\":{}}],\"filters\":[],\"uqmPageFilters\":[],\"uqmScopedPageGroups\":[],\"uqmCascadeGroupings\":[]},\"id\":\"a31b3cd2-f023-4b22-ac46-3e90b81c8e7a\",\"suggestedVizSettings\":{},\"definition\":{\"type\":\"CANVAS\",\"snapToGrid\":false,\"snapToObject\":true,\"layoutId\":\"3aa17cc5-e306-4045-b751-7b997d927294\",\"fitPageToDevice\":true,\"enableDevicePreview\":true,\"devicePreviewSize\":{\"width\":\"auto\",\"height\":\"auto\"}},\"thumbnail\":\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABQCAYAAADRAH3kAAAAAXNSR0IArs4c6QAAAkZJREFUeF7tmLFOAzEQRDfdSadQJz8AokaI/y8R9AgaoCIlUB1JcYi0UZCsiVf25KX22LezLzu+W8zzPAe/s3VgAQBn2/t94akA3D88xuvbe9zd3sT0s42Pzeao+9dXl/H59d3dmvVq1RVRABARp4QNALrin4dNnQBPzy/7kf73jxvHMaZpOtqBi+Uytrtdd2uGYeiKKgCIiFPCBgD/8M8EaG84MAGYAHkfgpgATAAugY0xkBoBjdXO42R/CSQC2mMudQIAAABwB2iMASYAr4G8BvIlMGkscQdIMrrgmNQIKHguliY5kAoAEyCpqwXHAACXQC6BXAILRoaylAhQ3KujJQKIACKACKgzXdi1AweIACKACCACkkYVbwFJRhccQwQQAUQAEVAwMpSlRIDiXh1tagTUKYFdFQdSAWACKK2qowUALoFcArkE1pkuB7sSAUlGFxxDBBABRAARUDAyWOrlABFABBABREDSVOMtIMnogmOIACKACCACCkaGspQIUNyro02NgDolsKviAAAo7hloAcCgiUoJAKC4Z6AFAIMmKiUAgOKegRYADJqolAAAinsGWgAwaKJSAgAo7hloAcCgiUoJAKC4Z6AFAIMmKiUAgOKegRYADJqolAAAinsGWgAwaKJSAgAo7hloAcCgiUoJAKC4Z6AFAIMmKiUAgOKegRYADJqolAAAinsGWgAwaKJSAgAo7hloAcCgiUoJAKC4Z6AFAIMmKiUAgOKegRYADJqolAAAinsGWgAwaKJSAgAo7hlofwGSpg96HEdlBwAAAABJRU5ErkJggg==\"}],\"storyFilters\":[],\"hyperlinkFilters\":[],\"queryDefinitions\":[],\"themingReference\":null,\"colorSync\":{\"version\":\"1.0.0\"},\"promptTokenDetails\":[],\"uqmIntegrationEnabled\":true,\"uqmStoryFilters\":[],\"uqmHyperlinkFilters\":[],\"uqmStoryLAFilters\":[],\"lastDataSource\":\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\",\"supportsBatchQuery\":true,\"storyWideSettings\":{\"analyticgrid.dynamictable\":{\"styles\":[],\"styleLib\":{\"key\":\"styleLib_16912196470750\",\"syncUpdateTime\":1691219647154,\"styles\":[{\"verticalAlignment\":1,\"alignment\":-1,\"name\":\"Default\",\"isDefault\":true,\"key\":\"16912196471548\",\"wordWrap\":false,\"isNone\":false,\"isUpdatedByUser\":true,\"fill\":\"transparent\",\"number\":{\"dataRegionFormat\":{},\"category\":4,\"typeSettings\":[{},{\"decimalPlaces\":2,\"currencyUnit\":{\"suffix\":\"$\"}},{\"decimalPlaces\":2,\"currencyUnit\":{\"suffix\":\"$\"}},{\"decimalPlaces\":2,\"currencyUnit\":{\"suffix\":\"$\"}},{}]},\"padding\":{\"left\":0,\"right\":0},\"cellChartSetting\":{\"chartType\":\"bar\",\"chartSetting\":{\"axisLineColor\":\"#000000\",\"dataLabelVisibility\":true}},\"border\":{\"lineStyle\":1,\"type\":[-1],\"width\":2},\"font\":{\"size\":13,\"type\":\"'72-Web'\",\"color\":\"rgb(88, 89, 91)\"},\"titleFont\":{\"color\":\"rgb(88, 89, 91)\",\"type\":\"'72-Web'\"},\"subtitleFont\":{\"color\":\"rgb(88, 89, 91)\",\"type\":\"'72-Web'\"},\"isFreeStyle\":true}],\"stylesMeta\":{\"stylesKeyHashMap\":{\"16912196471548\":{\"index\":0,\"hash\":\"-822726473\",\"refCount\":0}},\"styleHashMap\":{\"-822726473\":\"16912196471548\"}}},\"styleLibObj\":null},\"custom.color.palettes\":[],\"colors.recent\":[],\"custom.markers\":[],\"markers.recent\":[],\"markers.recent.custom\":[]},\"pinnedDataPoints\":{},\"thresholds\":{\"model\":{},\"story\":{}},\"gradientSync\":{\"version\":\"1.0.0\"},\"measureSync\":[],\"patternSync\":{},\"waterfallColorSync\":{\"version\":\"1.0.0\"},\"uqmDeletedDynamicFilters\":{},\"uqmDatasetAliasMap\":{},\"scaledMeasures\":[],\"uqmRemoteSystemNames\":[\"DWCLive\"],\"uqmStoryLAFilterContributors\":[],\"filterBarInfo\":{},\"filterBarSettings\":{\"runtimeVisibility\":\"auto\",\"layoutType\":\"vertical\",\"runtimeToolbarEnabled\":true},\"filterExperienceSettings\":{\"sortType\":\"default\",\"addFilterCapability\":true},\"persistedUqmQueryAndDMInfo\":{\"version\":\"2023.16.0\",\"timestamp\":\"2023-08-09T07:24:14.781Z\"},\"persistedUqmQuery\":[{\"id\":\"[{\\\"table\\\":\\\"93251686-6387-4321-8359-330671083228\\\"}]\",\"datasetEntityId\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"}]\",\"inaQuery\":{\"Analytics\":{\"Capabilities\":[\"AggregationNOPNULL\",\"AggregationNOPNULLZERO\",\"AsyncBatchRequest\",\"AsyncBlendingBatchRequest\",\"AsyncMetadataBatchRequest\",\"AttributeHierarchy\",\"AttributeHierarchyHierarchyFields\",\"AttributeHierarchyUniqueFields\",\"AttributeValueLookup\",\"AverageCountIgnoreNullZero\",\"BugFixHierarchyFlatKeys\",\"CEScenarioParams\",\"CalculateWithNullCellsUnitType\",\"CalculatedDimension\",\"CancelRunningRequests\",\"CellValueOperand\",\"ClientCapabilities\",\"Conditions\",\"ConditionsWithVersionDimension\",\"CubeBlending\",\"CubeBlendingCustomMembers\",\"CubeBlendingMemberSorting\",\"CubeBlendingOutOfContext\",\"CubeBlendingProperties\",\"CubeBlendingReadMode\",\"CurrencyTranslation\",\"CurrentMemberFilterExtension\",\"CustomDimension1MemberType\",\"CustomDimension2\",\"CustomDimensionFilterCapabilities\",\"CustomDimensionMemberExecutionStep\",\"CustomMemberSortOrder\",\"DataEntryOnUnbooked\",\"DatasourceAtService\",\"DimensionDescription\",\"DimensionKindChartOfAccounts\",\"DimensionKindEPMVersion\",\"EPMResponseListSharedVersions\",\"ExceptionAggregationAverageNullInSelectionMember\",\"ExceptionAggregationCountNullInSelectionMember\",\"ExceptionAggregationDimsAndFormulas\",\"ExceptionAggregationFirstLastInSelectionMember\",\"ExceptionSettings\",\"Exceptions\",\"ExpandHierarchyBottomUp\",\"ExtHierarchy\",\"ExtendedDimensions\",\"ExtendedDimensionsChangeDefaultRenamingAndDescription\",\"ExtendedDimensionsCopyAllHierarchies\",\"ExtendedDimensionsFieldMapping\",\"ExtendedDimensionsJoinCardinality\",\"ExtendedDimensionsJoinColumns\",\"ExtendedDimensionsOuterJoin\",\"ExtendedDimensionsSkip\",\"FastPath\",\"FixMetaDataHierarchyAttributes\",\"FlatKeyOnHierarchicalDisplay\",\"HierarchyAttributePathPresentationType\",\"HierarchyDataAndExcludingFilters\",\"HierarchyKeyTextName\",\"HierarchyNavigationDeltaMode\",\"HierarchyPath\",\"HierarchyPathUniqueName\",\"HierarchyTrapezoidFilter\",\"HierarchyVirtualRootNode\",\"IgnoreUnitOfNullValueInAggregation\",\"IgnoreUnitOfZeroValueInAggregation\",\"InAModelExternalDimension\",\"InAModelExternalValuehelp\",\"InputReadinessStates\",\"InputReadinessWithNavigationalAttributes\",\"IsVirtualDescription\",\"IteratedFormula\",\"ListReporting\",\"LocaleSorting\",\"MasterReadModeByDimensionGrouping\",\"MaxResultRecords\",\"MdsExpression\",\"MeasureMemberCurrencyTranslations\",\"MeasureMemberDetails\",\"MeasureMemberMetadata\",\"MetadataCubeQuery\",\"MetadataDataCategory\",\"MetadataDataSourceDefinitionValidation\",\"MetadataDataSourceDefinitionValidationExposeDataSource\",\"MetadataDefaultResultStructureResultAlignmentBottom\",\"MetadataDimensionCanBeAggregated\",\"MetadataDimensionDefaultMember\",\"MetadataDimensionGroup\",\"MetadataDimensionVisibility\",\"MetadataDynamicVariable\",\"MetadataExtendedDimensionVisibility\",\"MetadataHasExternalHierarchies\",\"MetadataHierarchyLevels\",\"MetadataHierarchyRestNode\",\"MetadataHierarchyStructure\",\"MetadataHierarchyUniqueName\",\"MetadataIsDisplayAttribute\",\"MetadataRepositorySuffix\",\"MetadataSemanticType\",\"MultipleExAggDimsInCalcPlan\",\"NamedCustomDimensionMember\",\"NullZeroSuppression\",\"Obtainability\",\"PagingTupleCountTotal\",\"PerformanceAnalysis\",\"PersistResultSet\",\"PlanningOnCalculatedDimension\",\"ReadMode\",\"ReadModeRelatedBooked\",\"RemoteBlending\",\"RemoteBlendingBW\",\"RemoteBlendingMetadata\",\"RemoteFilter\",\"RequestTimeZone\",\"RestrictedMembersConvertToFlatSelection\",\"ResultSetAxisType\",\"ResultSetCellDataType\",\"ResultSetCellExplain\",\"ResultSetCellFormatString\",\"ResultSetCellNumericShift\",\"ResultSetHierarchyLevel\",\"ResultSetInterval\",\"ResultSetState\",\"ResultSetUnitIndex\",\"ResultSetV2MetadataExtension1\",\"ReturnErrorForInvalidQueryModel\",\"ReturnRestrictedAndCalculatedMembersInReadmodeBooked\",\"ReturnedDataSelection\",\"RootOrphanNodesAfterVisibilityFilter\",\"SP9\",\"SemanticalErrorType\",\"SetNullCellsUnitType\",\"SetOperandCurrentMemberSingleNavigation\",\"SortNewValues\",\"SpatialClustering\",\"SpatialFilterSRID\",\"SpatialTransformDistanceFilter\",\"StatisticalAggregations\",\"SupportsComplexFilters\",\"SupportsCubeBlendingAggregation\",\"SupportsDataCellMixedValues\",\"SupportsEncodedResultSet\",\"SupportsEncodedResultSet2\",\"SupportsExtendedSort\",\"SupportsHierarchySelectionAsFlatSelection\",\"SupportsIgnoreExternalDimensions\",\"SupportsInAModelMetadata\",\"SupportsMemberVisibility\",\"SupportsSetOperand\",\"SupportsSpatialFilter\",\"SupportsSpatialTransformations\",\"TechnicalAxis\",\"Totals\",\"TotalsAfterVisibilityFilter\",\"UndefinedTupleCountTotals\",\"UniqueAttributeNames\",\"UniversalModel\",\"UseEPMVersion\",\"ValuesRounded\",\"Variables\",\"VirtualDataSourceTypeColumns\",\"VirtualDataSourceVariableValues\",\"VisibilityFilter\",\"VisualAggregation\"],\"DataSource\":{\"Context\":\"{\\\"sessionContext\\\":{}}\",\"InstanceId\":\"55678883-6536-b7cf-1667-d6623a778fd7\",\"ObjectName\":\"Rchling_Analytical_Model\",\"SchemaName\":\"BU_SINGER\",\"Type\":\"InAModel\"},\"Definition\":{\"Dimensions\":[{\"Attributes\":[{\"Name\":\"[Measures].[Measures]\",\"Obtainability\":\"UserInterface\"},{\"Name\":\"[Measures].[Description]\",\"Obtainability\":\"UserInterface\"}],\"Axis\":\"Columns\",\"Members\":[{\"MemberName\":\"COGS_GC\"},{\"MemberName\":\"Sales_Volume\"},{\"MemberName\":\"Sales_Price\"},{\"MemberName\":\"Ratio_Percent\"},{\"MemberName\":\"Ratio_Eur_per_Piece\"},{\"MemberName\":\"Seasonality\"},{\"MemberName\":\"Savings_GC\"},{\"MemberName\":\"Seasonality_Volume\"}],\"Name\":\"CustomDimension1\",\"NonEmpty\":false,\"ReadMode\":\"BookedAndSpaceAndState\"}],\"DynamicFilter\":{\"Selection\":{\"SetOperand\":{\"Elements\":[{\"Comparison\":\"=\",\"Low\":\"COGS_GC\"}],\"FieldName\":\"[Measures].[Measures]\"}}},\"Query\":{\"Axes\":[{\"Axis\":\"Columns\",\"Type\":2,\"ZeroSuppressionType\":3}]},\"ResultSetFeatureRequest\":{\"ResultEncoding\":\"None\",\"ResultFormat\":\"Version2\",\"ReturnedDataSelection\":{\"Actions\":true,\"CellDataType\":true,\"CellExplain\":false,\"CellFormat\":true,\"CellMeasure\":false,\"CellValueTypes\":true,\"ExceptionAlertLevel\":false,\"ExceptionName\":false,\"ExceptionSettings\":true,\"Exceptions\":true,\"InputEnabled\":false,\"InputReadinessStates\":true,\"NumericRounding\":true,\"NumericShift\":true,\"TupleDisplayLevel\":true,\"TupleDrillState\":true,\"TupleElementIds\":true,\"TupleElementIndexes\":false,\"TupleLevel\":true,\"TupleParentIndexes\":true,\"UnitDescriptions\":true,\"UnitIndex\":true,\"UnitTypes\":true,\"Units\":true,\"Values\":true,\"ValuesFormatted\":true,\"ValuesRounded\":true},\"SubSetDescription\":{\"ColumnFrom\":0,\"ColumnTo\":60,\"RowFrom\":0,\"RowTo\":500},\"UseDefaultAttributeKey\":false},\"Sort\":[]},\"Language\":\"EN_UK\"},\"ClientInfo\":{\"Context\":{\"WidgetId\":[\"93251686-6387-4321-8359-330671083228\"]}},\"Options\":[]},\"placeholderMappings\":\"{}\",\"metadata\":{\"measureStructureCount\":8,\"accountDimensionName\":null,\"versionDimensionName\":null,\"measureDimensionName\":\"CustomDimension1\",\"crossCalcDimensionName\":\"CustomDimension2\",\"granularity\":null,\"freeAxisFilterMemberName\":null,\"visibleDimensions\":[{\"name\":\"CustomDimension1\",\"hierarchy\":null,\"datasetId\":\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\",\"axis\":\"Columns\",\"axisIndex\":0}],\"measuresNumberFormattings\":{\"COGS_GC\":{\"numericShift\":null,\"scale\":null}}}}],\"persistedUdm\":[{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"}]\",\"dimensions\":[{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"}]\",\"dimensionId\":\"CustomDimension1\",\"entityType\":\"DIMENSION\",\"type\":\"MeasureStructure\",\"subType\":\"measure\",\"valueType\":\"string\",\"semanticType\":\"dimension\",\"isGroupingDimension\":true,\"caption\":\"Measures\",\"externalName\":null,\"attributes\":{\"[Measures].[Measures]\":{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"attributeId\\\":\\\"[Measures].[Measures]\\\"}]\",\"entityType\":\"ATTRIBUTE\",\"isKey\":true,\"type\":\"string\",\"text\":\"Measures\",\"isFlatKey\":true},\"[Measures].[Description]\":{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"attributeId\\\":\\\"[Measures].[Description]\\\"}]\",\"entityType\":\"ATTRIBUTE\",\"type\":\"string\",\"isTechnical\":false,\"isHierarchyPathField\":false,\"isCubeBlendingPropertiesField\":false,\"semanticType\":\"description\"},\"[Measures].[Name]\":{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"attributeId\\\":\\\"[Measures].[Name]\\\"}]\",\"entityType\":\"ATTRIBUTE\",\"type\":\"string\",\"isTechnical\":false,\"isHierarchyPathField\":false,\"isCubeBlendingPropertiesField\":false,\"semanticType\":\"dimension.[name]\",\"text\":\"Name\"},\"[Measures].[SQLType]\":{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"attributeId\\\":\\\"[Measures].[SQLType]\\\"}]\",\"entityType\":\"ATTRIBUTE\",\"type\":\"string\",\"isTechnical\":false,\"isHierarchyPathField\":false,\"isCubeBlendingPropertiesField\":false,\"semanticType\":\"dimension.[sqltype]\",\"text\":\"SQLType\"},\"[Measures].[ColumnType]\":{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"attributeId\\\":\\\"[Measures].[ColumnType]\\\"}]\",\"entityType\":\"ATTRIBUTE\",\"type\":\"integer\",\"isTechnical\":false,\"isHierarchyPathField\":false,\"isCubeBlendingPropertiesField\":false,\"semanticType\":\"dimension.[columntype]\",\"text\":\"ColumnType\"},\"[Measures].[Digits]\":{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"attributeId\\\":\\\"[Measures].[Digits]\\\"}]\",\"entityType\":\"ATTRIBUTE\",\"type\":\"integer\",\"isTechnical\":false,\"isHierarchyPathField\":false,\"isCubeBlendingPropertiesField\":false,\"semanticType\":\"dimension.[digits]\",\"text\":\"Digits\"},\"[Measures].[FractDigits]\":{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"attributeId\\\":\\\"[Measures].[FractDigits]\\\"}]\",\"entityType\":\"ATTRIBUTE\",\"type\":\"integer\",\"isTechnical\":false,\"isHierarchyPathField\":false,\"isCubeBlendingPropertiesField\":false,\"semanticType\":\"dimension.[fractdigits]\",\"text\":\"FractDigits\"},\"[Measures].[Aggregation]\":{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"attributeId\\\":\\\"[Measures].[Aggregation]\\\"}]\",\"entityType\":\"ATTRIBUTE\",\"type\":\"integer\",\"isTechnical\":false,\"isHierarchyPathField\":false,\"isCubeBlendingPropertiesField\":false,\"semanticType\":\"dimension.[aggregation]\",\"text\":\"Aggregation\"},\"[Measures].[AggregationDimension]\":{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"attributeId\\\":\\\"[Measures].[AggregationDimension]\\\"}]\",\"entityType\":\"ATTRIBUTE\",\"type\":\"string\",\"isTechnical\":false,\"isHierarchyPathField\":false,\"isCubeBlendingPropertiesField\":false,\"semanticType\":\"dimension.[aggregationdimension]\",\"text\":\"AggregationDimension\"},\"[Measures].[SemanticType]\":{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"attributeId\\\":\\\"[Measures].[SemanticType]\\\"}]\",\"entityType\":\"ATTRIBUTE\",\"type\":\"string\",\"isTechnical\":false,\"isHierarchyPathField\":false,\"isCubeBlendingPropertiesField\":false,\"semanticType\":\"dimension.[semantictype]\",\"text\":\"SemanticType\"},\"[Measures].[DisplayFolder]\":{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"attributeId\\\":\\\"[Measures].[DisplayFolder]\\\"}]\",\"entityType\":\"ATTRIBUTE\",\"type\":\"string\",\"isTechnical\":false,\"isHierarchyPathField\":false,\"isCubeBlendingPropertiesField\":false,\"semanticType\":\"dimension.[displayfolder]\",\"text\":\"DisplayFolder\"}},\"isBWCompoundDimension\":false,\"isHierarchyMandatory\":false,\"supportsHierarchy\":false,\"hasFlexibleTimeGroupingDimension\":false,\"numberOfHierarchies\":0}],\"measures\":[{\"id\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"measureId\\\":\\\"COGS_GC\\\"}]\",\"entityType\":\"MEASURE\",\"valueType\":\"number\",\"measureId\":\"COGS_GC\",\"displayKey\":\"COGS_GC\",\"description\":\"COGS_GC\",\"isAccountMemeber\":false,\"isSecondary\":false,\"isNonNumeric\":false,\"isPercent\":false,\"isLeaf\":true,\"decimalPlaces\":7,\"numericShift\":null,\"defaultAggregationType\":\"SUM\"}],\"secondaryMeasures\":[],\"dataModelInfo\":{\"systemName\":\"DWCLive\",\"name\":\"Cum09400ha9q67vbn8c0o13soj\",\"displayName\":\"Rchling_Analytical_Model3\",\"description\":\"Rchling_Analytical_Model3\",\"shortDescription\":\"Rchling_Analytical_Model3\",\"datasetId\":\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\",\"isInAModel\":true,\"isPlanning\":false,\"isExtendedHanaLiveWithCalcViewModelling\":false,\"isPlanningEnabled\":false,\"isRemote\":true,\"isEmbedded\":true,\"isPrivate\":false,\"isIntegrated\":true,\"isCurrencySupported\":false,\"currencies\":[],\"defaultCurrency\":\"\",\"hasAccountDimension\":false,\"hasUserDefinedMeasures\":true,\"hasVirtualVersionDimension\":false,\"extendedDimensions\":[],\"lastUpdated\":\"2023-08-09T07:23:56.653Z\",\"ancestorPath\":[{\"resourceId\":\"PUBLIC\",\"name\":\"PUBLIC\",\"auth\":{\"assign\":false,\"read\":true,\"update\":false,\"delete\":false,\"create_doc\":false,\"create_folder\":false,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":false}},{\"resourceId\":\"99D72F2C25FC0AD1A14DFB82E881C61\",\"name\":\"INTERN\",\"auth\":{\"assign\":false,\"read\":true,\"update\":false,\"delete\":false,\"create_doc\":false,\"create_folder\":false,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":false}},{\"resourceId\":\"676002F6BC88969737BFF6EDCF632DDE\",\"name\":\"Business Units\",\"auth\":{\"assign\":false,\"read\":true,\"update\":false,\"delete\":false,\"create_doc\":false,\"create_folder\":false,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":false}},{\"resourceId\":\"7AA002F61C098C9D73400262C47298A2\",\"name\":\"BU Singer\",\"auth\":{\"assign\":true,\"read\":true,\"update\":true,\"delete\":true,\"create_doc\":true,\"create_folder\":true,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":true,\"maintain\":true}},{\"resourceId\":\"2F2A1B0369120B7355CFABCEC56B6B07\",\"name\":\"David Wurm\",\"auth\":{\"assign\":true,\"read\":true,\"update\":true,\"delete\":true,\"create_doc\":true,\"create_folder\":true,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":true,\"maintain\":true}},{\"resourceId\":\"D7A855046F3DB9DA7D9632256B9B338B\",\"name\":\"Business Development\",\"auth\":{\"assign\":true,\"read\":true,\"update\":true,\"delete\":true,\"create_doc\":true,\"create_folder\":true,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":true,\"maintain\":true}},{\"resourceId\":\"F3320D046F386F704F6D26AE2DFDA980\",\"name\":\"Custom Widget\",\"auth\":{\"assign\":true,\"read\":true,\"update\":true,\"delete\":true,\"create_doc\":true,\"create_folder\":true,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":true,\"maintain\":true}},{\"resourceId\":\"179AF700C1F6054D4DB416C623EE5D2B\",\"name\":\"DSP_CHANGE_CONNECTION\",\"auth\":{\"assign\":true,\"read\":true,\"update\":true,\"delete\":true,\"create_doc\":true,\"create_folder\":true,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":true}}],\"dataAccessLanguage\":\"en_UK\",\"dataExportRestricted\":false,\"validationHash\":\"210197078\",\"dataSource\":{\"objectName\":\"Rchling_Analytical_Model\",\"schemaName\":\"BU_SINGER\",\"type\":\"InAModel\"},\"planningFeatures\":{},\"systemType\":\"HANA\",\"isBW\":false,\"isBPCE\":false,\"hasSecondaryStructure\":true,\"modelId\":\"t.K.Cum09400ha9q67vbn8c0o13soj:Cum09400ha9q67vbn8c0o13soj\",\"lastRefreshedAt\":null,\"lastChangedBy\":\"\",\"sourceDescription\":\"Röchling Analytical Model\",\"datasetHasDynamicFilters\":false}}],\"persistedMergeGroupQuery\":\"\",\"preExecuteUqmQueryIds\":[\"[{\\\"table\\\":\\\"93251686-6387-4321-8359-330671083228\\\"}]\"],\"uqmVariablesDataModelInfo\":{\"dataAccessLanguage\":\"en_UK\",\"variableContainers\":{}}},\"dynamicText\":{}},{\"appPages\":[{\"instanceId\":\"[{\\\"appPage\\\":\\\"a31b3cd2-f023-4b22-ac46-3e90b81c8e7a\\\"}]\",\"payload\":{\"pageId\":\"a31b3cd2-f023-4b22-ac46-3e90b81c8e7a\",\"behaviorMode\":\"CANVAS\",\"referencedWidgetInstanceIds\":[]}}],\"bookmarks\":[{\"instanceId\":\"[{\\\"bookmark\\\":\\\"25318688-9822-4282-9629-154743758514\\\"}]\",\"payload\":{\"version\":1,\"isOnlyChangedWidget\":true}}],\"app\":{\"names\":{\"[{\\\"appPage\\\":\\\"a31b3cd2-f023-4b22-ac46-3e90b81c8e7a\\\"}]\":\"Page_1\",\"[{\\\"bookmark\\\":\\\"25318688-9822-4282-9629-154743758514\\\"}]\":\"Bookmarks\",\"[{\\\"story\\\":\\\"storyID\\\"},{\\\"table\\\":\\\"93251686-6387-4321-8359-330671083228\\\"}]\":\"Table_1\"},\"events\":{},\"globalVars\":{},\"partialLibraryLoading\":true,\"busyIndicatorProperties\":{\"enabledAuto\":false,\"delay\":1000,\"text\":\"Loading the application\"},\"loadInvisibleWidgets\":\"inBackground\",\"navigation\":{\"overrideDefaultSetting\":false,\"navigationType\":\"tabs\"},\"devicePreview\":{\"enableDevicePreview\":true,\"devicePreviewSize\":{\"width\":\"auto\",\"height\":\"auto\"}},\"scheduling\":{\"isAuto\":true},\"planning\":{\"showPlanningLeaveDialog\":true}},\"id\":\"6e8b7961-9994-4bfd-bce6-e1ace133f6f5:application\"},{\"type\":\"analyticgrid.dynamictable\",\"id\":\"fb42da96-2d4a-4874-9c49-7b8a190994e6\",\"vendorId\":\"sap.epm.story.entity.dynamictable.DynamicTableVendor\",\"data\":{\"tileId\":\"e003480c-72ce-433f-808b-411a4430000b\",\"title\":\"\",\"content\":{\"dataSource\":{\"cubeId\":\"CUBE:t.K.Ceuhfe061u0dhnu9mbc2ir47465:Ceuhfe061u0dhnu9mbc2ir47465\",\"packageName\":\"t.K.Ceuhfe061u0dhnu9mbc2ir47465\",\"queryId\":\"view:[_SYS_BIC][t.K.Ceuhfe061u0dhnu9mbc2ir47465][Ceuhfe061u0dhnu9mbc2ir47465]\",\"isRemote\":true,\"systemName\":\"DWCLive\",\"remoteObjectType\":\"InAModel\",\"remoteObjectName\":\"ROECHLING_SALES_PLANNING_VIEW\",\"remotePackageName\":\"\",\"remoteSchemaName\":\"BU_SINGER\",\"name\":\"Ceuhfe061u0dhnu9mbc2ir47465\",\"shortDescription\":\"ROECHLING_SALES_PLANNING_VIEW\",\"description\":\"ROECHLING_SALES_PLANNING_VIEW\",\"environmentName\":null,\"modelName\":null},\"newTableType\":true,\"version\":1.5,\"capabilityConstants\":[\"CALCULATION_CAPABILITY\",\"CAPABILITY_DUMMY_CELL_CONTEXT_FIX\",\"DUMMY_CELL_CONTEXT_HEADER_STABILITY\"],\"key\":\"grid_16912196470921\",\"segments\":[{\"key\":\"segment_169158205872043\",\"height\":0,\"rowHeight\":0},{\"key\":\"segment_169158205898047\",\"height\":4,\"rowHeight\":2,\"dataRegion\":{\"fluidDataEntry\":true,\"dynamicTimeFilterEnabledDimensions\":[],\"tableType\":\"CROSSTAB\",\"key\":\"dataRegion_169158205897946\",\"showTitle\":true,\"showTitleText\":true,\"showSubtitle\":true,\"showDetails\":true,\"showDimensionHeaders\":false,\"zeroSuppression\":false,\"nullSuppression\":false,\"zeroSuppressionOnRows\":false,\"zeroSuppressionOnColumns\":false,\"repeatMembers\":false,\"showStickyMembers\":false,\"enforceDataLocks\":true,\"showValidationWarnings\":true,\"showDataLockingIcons\":false,\"showScaleCurrencyOnRow\":false,\"showScaleCurrencyOnColumn\":false,\"showScaleCurrencyInCells\":false,\"thresholdStyle\":0,\"showReadinessInfo\":false,\"thresholdInfo\":{\"thresholds\":[],\"invalidThresholds\":[]},\"planningAsExplicitStepEnabled\":false,\"openInInputMode\":false,\"enableReadOnly\":false,\"massDataEntryAsDefault\":false,\"defaultDataEntryMode\":\"FluidDataEntry\",\"enableDPC\":false,\"inputEnablementWithDataAccessControl\":true,\"dataSource\":{\"cubeId\":\"CUBE:t.K.Cum09400ha9q67vbn8c0o13soj:Cum09400ha9q67vbn8c0o13soj\",\"packageName\":\"t.K.Cum09400ha9q67vbn8c0o13soj\",\"queryId\":\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\",\"isRemote\":true,\"systemName\":\"DWCLive\",\"remoteObjectType\":\"InAModel\",\"remoteObjectName\":\"Rchling_Analytical_Model\",\"remotePackageName\":\"\",\"remoteSchemaName\":\"BU_SINGER\",\"name\":\"Cum09400ha9q67vbn8c0o13soj\",\"shortDescription\":\"Rchling_Analytical_Model3\",\"description\":\"Rchling_Analytical_Model3\",\"environmentName\":null,\"modelName\":null},\"relativeCoordinate\":{\"relativeObjectTypeX\":0,\"relativeObjectTypeY\":0,\"x\":0,\"y\":0},\"title\":\"Rchling_Analytical_Model3\",\"dataDisaggregationWithDataLocking\":false,\"inputEnablementWithDataLocking\":true,\"dataDisaggregationWithValidationRules\":false,\"inputEnablementWithValidationRules\":false,\"datasetJoins\":[{\"id\":\"CUBE:t.K.Cum09400ha9q67vbn8c0o13soj:Cum09400ha9q67vbn8c0o13soj\",\"joinType\":null,\"inUse\":true}],\"initialMeasureFilter\":true,\"nullSuppressionOnRows\":true,\"nullSuppressionOnColumns\":true,\"defaultNullSuppressionApplied\":true,\"filterDefinitions\":[{\"unifiedFilter\":{\"type\":\"Member\",\"entityId\":[{\"id\":\"CustomDimension1\",\"type\":\"dimension\",\"parentKey\":{\"id\":\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\",\"type\":\"dataset\"}}],\"filterTokenInfo\":{\"selectionType\":\"multiple\",\"allowModification\":true,\"icAllowDeletion\":true},\"filterId\":\"25762870-3127-4685-9418-611781943633\",\"showType\":\"1\",\"bookedDataOnly\":true,\"originalValues\":[{\"operator\":\"IN\",\"argumentKeyInfo\":[{\"sKey\":\"COGS_GC\",\"displayName\":\"COGS_GC\",\"displayKey\":\"COGS_GC\"}],\"displayName\":\"COGS_GC\"}],\"filters\":[{\"answers\":[{\"arguments\":[[\"COGS_GC\"]],\"function\":\"IN\"}],\"exclude\":false,\"allLovSelected\":true,\"entityId\":[{\"id\":\"CustomDimension1\",\"type\":\"dimension\",\"parentKey\":{\"id\":\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\",\"type\":\"dataset\"}}],\"dynamicLov\":false}],\"hierarchyName\":[]}}],\"measureFieldSelections\":\"[]\",\"crossCalculationFieldSelections\":\"[]\",\"templateKey\":\"tablestyle\",\"IBCSSubtotalLocation\":false,\"calculationMetadata\":{},\"measureOrder\":[{\"dimId\":\"COGS_GC\",\"name\":\"COGS_GC\"},{\"dimId\":\"Sales_Volume\",\"name\":\"Sales_Volume\"},{\"dimId\":\"Sales_Price\",\"name\":\"Sales_Price\"},{\"dimId\":\"Ratio_Percent\",\"name\":\"Ratio_Percent\"},{\"dimId\":\"Ratio_Eur_per_Piece\",\"name\":\"Ratio_Eur_per_Piece\"},{\"dimId\":\"Seasonality\",\"name\":\"Seasonality\"},{\"dimId\":\"Savings_GC\",\"name\":\"Savings_GC\"},{\"dimId\":\"Seasonality_Volume\",\"name\":\"Seasonality_Volume\"}],\"universalDisplayHierarchyActive\":false,\"hasUDHActiveOnRow\":false,\"hasUDHActiveOnColumn\":false,\"width\":1,\"height\":2,\"dataRows\":1,\"dataCols\":1,\"storageFormat\":\"INA_REPO_DATA\",\"titleChunks\":[{\"type\":\"string\",\"text\":\"Rchling_Analytical_Model3\"}],\"titleDom\":\"Rchling_Analytical_Model3\",\"filterInstanceIds\":[{\"idStr\":\"[{\\\"app\\\":\\\"MAIN_APPLICATION\\\"},{\\\"story\\\":\\\"storyID\\\"},{\\\"table\\\":\\\"93251686-6387-4321-8359-330671083228\\\"},{\\\"VizLocalFilter\\\":\\\"25762870-3127-4685-9418-611781943633\\\"}]\",\"lastPair\":{\"storeEntityType\":\"VizLocalFilter\",\"relativeId\":\"25762870-3127-4685-9418-611781943633\"},\"debugKey\":\"[{\\\"VizLocalFilter\\\":\\\"25762870-3127-4685-9418-611781943633\\\"},{\\\"app\\\":\\\"MAIN_APPLICATION\\\"},{\\\"story\\\":\\\"storyID\\\"},{\\\"table\\\":\\\"93251686-6387-4321-8359-330671083228\\\"}]\"}],\"filterICElements\":[{\"display\":{\"showApplySelectionsButton\":true},\"extendedSelection\":{\"isCascadedOut\":false,\"targetEntity\":{\"datasetEntityId\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"}]\",\"dimensionEntityId\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"}]\"},\"isAllowReset\":true},\"lovInfo\":{\"staticMembers\":[{\"key\":\"COGS_GC\",\"caption\":\"COGS_GC\",\"displayId\":\"COGS_GC\"}]},\"schemaType\":\"IC_MEMBER\",\"icElementStringId\":\"25762870-3127-4685-9418-611781943633\",\"userSelection\":{\"isAllSelected\":true,\"selections\":[]}}],\"serializedFFRuntimeQueryManager\":null,\"ffQuery\":\"{\\\"CType\\\":\\\"QueryModel\\\",\\\"CellContextRequests\\\":{\\\"CType\\\":\\\"CellContextManager\\\",\\\"Elements\\\":[]},\\\"Cells\\\":{},\\\"ComponentTags\\\":[{\\\"KEY\\\":\\\"UDM_INSTANCE_ID\\\",\\\"VALUE\\\":\\\"[{\\\\\\\"app\\\\\\\":\\\\\\\"MAIN_APPLICATION\\\\\\\"},{\\\\\\\"story\\\\\\\":\\\\\\\"storyID\\\\\\\"},{\\\\\\\"udm\\\\\\\":\\\\\\\"udm\\\\\\\"}]\\\"},{\\\"KEY\\\":\\\"localId\\\",\\\"VALUE\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"}],\\\"ConditionsRepo\\\":{},\\\"DataSource\\\":{\\\"Description\\\":\\\"Röchling Analytical Model\\\",\\\"ObjectName\\\":\\\"Rchling_Analytical_Model\\\",\\\"SchemaName\\\":\\\"BU_SINGER\\\",\\\"System\\\":\\\"DWCLive\\\",\\\"Type\\\":\\\"InAModel\\\"},\\\"DimensionsRepo\\\":{\\\"CType\\\":\\\"Dimensions\\\",\\\"ComponentTags\\\":[{\\\"KEY\\\":\\\"UDM_INSTANCE_ID\\\",\\\"VALUE\\\":\\\"[{\\\\\\\"app\\\\\\\":\\\\\\\"MAIN_APPLICATION\\\\\\\"},{\\\\\\\"story\\\\\\\":\\\\\\\"storyID\\\\\\\"},{\\\\\\\"udm\\\\\\\":\\\\\\\"udm\\\\\\\"}]\\\"},{\\\"KEY\\\":\\\"localId\\\",\\\"VALUE\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"}],\\\"Elements\\\":[{\\\"Axis\\\":\\\"Columns\\\",\\\"CType\\\":\\\"Dimension\\\",\\\"ComponentTags\\\":[{\\\"KEY\\\":\\\"dimensionInitialized\\\",\\\"VALUE\\\":\\\"true\\\"}],\\\"FieldLayoutType\\\":\\\"FieldBased\\\",\\\"FieldSettings\\\":[],\\\"MembersRepo\\\":[{\\\"CType\\\":\\\"BasicMeasure\\\",\\\"KeyRef\\\":{\\\"GroupName\\\":\\\"CustomDimension1\\\",\\\"ObjectName\\\":\\\"COGS_GC\\\",\\\"StorageName\\\":\\\"main\\\"}},{\\\"CType\\\":\\\"BasicMeasure\\\",\\\"KeyRef\\\":{\\\"GroupName\\\":\\\"CustomDimension1\\\",\\\"ObjectName\\\":\\\"Sales_Volume\\\",\\\"StorageName\\\":\\\"main\\\"}},{\\\"CType\\\":\\\"BasicMeasure\\\",\\\"KeyRef\\\":{\\\"GroupName\\\":\\\"CustomDimension1\\\",\\\"ObjectName\\\":\\\"Sales_Price\\\",\\\"StorageName\\\":\\\"main\\\"}},{\\\"CType\\\":\\\"BasicMeasure\\\",\\\"KeyRef\\\":{\\\"GroupName\\\":\\\"CustomDimension1\\\",\\\"ObjectName\\\":\\\"Ratio_Percent\\\",\\\"StorageName\\\":\\\"main\\\"}},{\\\"CType\\\":\\\"BasicMeasure\\\",\\\"KeyRef\\\":{\\\"GroupName\\\":\\\"CustomDimension1\\\",\\\"ObjectName\\\":\\\"Ratio_Eur_per_Piece\\\",\\\"StorageName\\\":\\\"main\\\"}},{\\\"CType\\\":\\\"BasicMeasure\\\",\\\"KeyRef\\\":{\\\"GroupName\\\":\\\"CustomDimension1\\\",\\\"ObjectName\\\":\\\"Seasonality\\\",\\\"StorageName\\\":\\\"main\\\"}},{\\\"CType\\\":\\\"BasicMeasure\\\",\\\"KeyRef\\\":{\\\"GroupName\\\":\\\"CustomDimension1\\\",\\\"ObjectName\\\":\\\"Savings_GC\\\",\\\"StorageName\\\":\\\"main\\\"}},{\\\"CType\\\":\\\"BasicMeasure\\\",\\\"KeyRef\\\":{\\\"GroupName\\\":\\\"CustomDimension1\\\",\\\"ObjectName\\\":\\\"Seasonality_Volume\\\",\\\"StorageName\\\":\\\"main\\\"}}],\\\"Name\\\":\\\"CustomDimension1\\\",\\\"OrderedStructureMemberNames\\\":[\\\"COGS_GC\\\",\\\"Sales_Volume\\\",\\\"Sales_Price\\\",\\\"Ratio_Percent\\\",\\\"Ratio_Eur_per_Piece\\\",\\\"Seasonality\\\",\\\"Savings_GC\\\",\\\"Seasonality_Volume\\\"],\\\"ReadMode\\\":\\\"BookedAndSpaceAndState\\\",\\\"ResultSetAttributeFields\\\":[[{\\\"Name\\\":\\\"[Measures].[Measures]\\\"},{\\\"Name\\\":\\\"[Measures].[Description]\\\"}]],\\\"ResultSetAttributeNodes\\\":[\\\"CustomDimension1\\\"],\\\"ResultSetFields\\\":[],\\\"SelectorReadMode\\\":\\\"Booked\\\"}]},\\\"ExceptionsRepo\\\":{\\\"CType\\\":\\\"Exceptions\\\",\\\"ComponentTags\\\":[{\\\"KEY\\\":\\\"UDM_INSTANCE_ID\\\",\\\"VALUE\\\":\\\"[{\\\\\\\"app\\\\\\\":\\\\\\\"MAIN_APPLICATION\\\\\\\"},{\\\\\\\"story\\\\\\\":\\\\\\\"storyID\\\\\\\"},{\\\\\\\"udm\\\\\\\":\\\\\\\"udm\\\\\\\"}]\\\"},{\\\"KEY\\\":\\\"localId\\\",\\\"VALUE\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"}]},\\\"ExperimentalFeatures\\\":\\\"Olap.AgileBI.CustomDimension2,Olap.AsyncBlendingBatchRequest,Olap.AutoVariableSubmitCapability,Olap.AutoVariableSubmitFunctionality,Olap.CDSProjectionViews,Olap.CalculateWithNullCellsUnitType,Olap.CellDocumentId,Olap.ClientInfoMetadata,Olap.Conditions,Olap.ConditionsWithVersionDimension,Olap.CorrectDimensionDescription,Olap.CurrencyTranslation,Olap.CustomDimension1MemberType,Olap.DataCellContexts,Olap.DevelopmentModePlanning,Olap.DimensionKeyAttributes,Olap.ErrorAboveLevel,Olap.ExceptionThresholdNoPrec,Olap.ExternalizeDynamicFilter,Olap.ExternalizeNonVariableFilter,Olap.FilterAcrossModelsLovCache,Olap.FlexibleTimeDynamicTime,Olap.HierarchyPathPresentationType,Olap.ImprovedDynamicVariableUpdate,Olap.InAMergeProcessing,Olap.InAModel.CustomDimension2,Olap.InAModelExternalDimension,Olap.InAModelExternalValuehelp,Olap.InAPersisted,Olap.InAShiftPeriodForTransientTimeOperations,Olap.InputReadinessWithNavigationalAttributes,Olap.IsVirtualDescription,Olap.IteratedFormula,Olap.LazyLoadingSFXAccountMembers,Olap.LovBasedFilterAcrossModels,Olap.MaintainsVariableVariants,Olap.MaxDrillLevel,Olap.MeasureMemberCurrencyTranslations,Olap.MeasureMemberDetails,Olap.MeasureMemberMetadata,Olap.MemberOverrideTexts,Olap.MetadataCaching,Olap.MetadataHasExternalHierarchies,Olap.MultipleAccountHierarchies,Olap.NamedCustomDimensionMember,Olap.NullZeroSuppression,Olap.Olap.SpatialTransformDistanceFilter,Olap.OptimizeHierarchyExport,Olap.PerformanceAnalysis,Olap.PersistPagingInRepo,Olap.PlanningBatch,Olap.ResultSetHierarchyLevel,Olap.ResultSetV2MetadataExtension1,Olap.ReturnMetadataExtensions,Olap.RootOrphanNodesAfterVisibilityFilter,Olap.SemanticObject,Olap.SfxDimensionCustomizedDesc,Olap.SfxMinimumDrillState,Olap.SimpleVariableExit,Olap.SortAndRankWithDimensionsOnColumn,Olap.SortNewValues,Olap.StoreHierarchyMemberNamesAsFlat,Olap.SupportStructureOnFreeAxis,Olap.SupportsELTSIDPresentation,Olap.SupportsSIDPresentation,Olap.SuppressSupplements,Olap.TextInHierarchy,Olap.TimeMeasureWithFlatAndHierarchicalFilter,Olap.UndefinedTupleCountTotals,Olap.UnivModelInheritedPropsRaisedPriority,Olap.UniversalDisplayHierarchyAlignment,Olap.UniversalModel,Olap.VirtualDataSourceTypeColumns,Olap.enhanceSortAndRankBySecondaryMeasure,Rpc.AutoCsrfCall,Rpc.BwSessionIdViaGetResponse,Rpc.ServerMetadataViaSystemConnect,Rpc.SharedCsrfTokens\\\",\\\"FilterRepo\\\":{\\\"CType\\\":\\\"Filter\\\",\\\"DynamicFilter\\\":{\\\"CType\\\":\\\"FilterExpression\\\",\\\"CellValueOperand\\\":[],\\\"FilterRoot\\\":{\\\"CType\\\":\\\"FilterAlgebra\\\",\\\"Code\\\":\\\"And\\\",\\\"Id\\\":\\\"8f18a18a-cd92-90f2-7419-5f82e4396a77\\\",\\\"SubSelections\\\":[]},\\\"Id\\\":\\\"7c583d0a-1f4b-1310-6d0f-9e5574e8a2a6\\\",\\\"IsSuppressingNulls\\\":false},\\\"VisibilityFilter\\\":{\\\"CType\\\":\\\"FilterExpression\\\",\\\"CellValueOperand\\\":[],\\\"Id\\\":\\\"737c5ac6-b5c3-a161-321e-a0a79d614d3f\\\",\\\"IsSuppressingNulls\\\":false}},\\\"FormulaExceptionManager\\\":{\\\"ActiveStatusModelExceptions\\\":[],\\\"CType\\\":\\\"FormulaExceptions\\\",\\\"FormulaExceptions\\\":[],\\\"FormulaResultVisible\\\":false},\\\"HierarchyNavigationsRepo\\\":{},\\\"IsVersionDimensionValidationEnabled\\\":false,\\\"Query\\\":{\\\"AxesLayout\\\":[{\\\"Axis\\\":\\\"Free\\\",\\\"OrderedDimensionNames\\\":[\\\"Date\\\",\\\"Material_Status\\\",\\\"Plant\\\",\\\"Roech_Product\\\",\\\"Vehicle\\\",\\\"Version\\\",\\\"CustomDimension2\\\"]},{\\\"Axis\\\":\\\"Columns\\\",\\\"OrderedDimensionNames\\\":[\\\"CustomDimension1\\\"]},{\\\"Axis\\\":\\\"Technical\\\",\\\"OrderedDimensionNames\\\":[\\\"$$Cells$$\\\"]}],\\\"AxesRepo\\\":{\\\"CType\\\":\\\"AxesSettings\\\",\\\"ComponentTags\\\":[{\\\"KEY\\\":\\\"UDM_INSTANCE_ID\\\",\\\"VALUE\\\":\\\"[{\\\\\\\"app\\\\\\\":\\\\\\\"MAIN_APPLICATION\\\\\\\"},{\\\\\\\"story\\\\\\\":\\\\\\\"storyID\\\\\\\"},{\\\\\\\"udm\\\\\\\":\\\\\\\"udm\\\\\\\"}]\\\"},{\\\"KEY\\\":\\\"localId\\\",\\\"VALUE\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"}],\\\"Elements\\\":[{\\\"Axis\\\":\\\"Columns\\\",\\\"CType\\\":\\\"Axis\\\",\\\"Layout\\\":[\\\"CustomDimension1\\\"],\\\"ResultStructureRepo\\\":{\\\"CType\\\":\\\"Totals\\\",\\\"ResultAlignment\\\":\\\"Default\\\",\\\"Visibility\\\":\\\"Default\\\"},\\\"Type\\\":2,\\\"ZeroSuppressionType\\\":3},{\\\"Axis\\\":\\\"Rows\\\",\\\"CType\\\":\\\"Axis\\\",\\\"Layout\\\":[],\\\"ResultStructureRepo\\\":{\\\"CType\\\":\\\"Totals\\\",\\\"ResultAlignment\\\":\\\"Default\\\",\\\"Visibility\\\":\\\"Default\\\"},\\\"Type\\\":1,\\\"ZeroSuppressionType\\\":3}]}},\\\"QueryDataCellsRepo\\\":{\\\"CType\\\":\\\"DataCells\\\",\\\"ComponentTags\\\":[{\\\"KEY\\\":\\\"UDM_INSTANCE_ID\\\",\\\"VALUE\\\":\\\"[{\\\\\\\"app\\\\\\\":\\\\\\\"MAIN_APPLICATION\\\\\\\"},{\\\\\\\"story\\\\\\\":\\\\\\\"storyID\\\\\\\"},{\\\\\\\"udm\\\\\\\":\\\\\\\"udm\\\\\\\"}]\\\"},{\\\"KEY\\\":\\\"localId\\\",\\\"VALUE\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"}]},\\\"ResultSetPersistanceIdentifier\\\":null,\\\"ResultSetPersistanceSchema\\\":null,\\\"ResultSetPersistanceTable\\\":null,\\\"ResultStructureRepo\\\":{\\\"CType\\\":\\\"Totals\\\",\\\"ResultAlignment\\\":\\\"Default\\\",\\\"Visibility\\\":\\\"Default\\\"},\\\"SortRepo\\\":{\\\"CType\\\":\\\"Sorting\\\",\\\"Elements\\\":[]},\\\"SubSetDescription\\\":{\\\"ColumnFrom\\\":0,\\\"ColumnTo\\\":60,\\\"RowFrom\\\":0,\\\"RowTo\\\":500}}\",\"styles\":[],\"formattingRuleProc\":{\"formattingRules\":[]},\"templateStyles\":[{\"key\":\"row-header\",\"style\":{\"font\":{\"boldFace\":true}}},{\"key\":\"col-header\",\"style\":{\"alignment\":1,\"font\":{\"boldFace\":true}}},{\"key\":\"data-row-even\",\"style\":{\"fill\":\"rgba(231,231,231,0.6)\"}},{\"key\":\"row-dim-header\",\"style\":{\"font\":{\"boldFace\":true}}},{\"key\":\"col-dim-header\",\"style\":{\"alignment\":1,\"font\":{\"boldFace\":true}}},{\"key\":\"row-dim-attr-header\",\"style\":{\"font\":{\"italicFace\":true},\"isReadOnly\":true}},{\"key\":\"col-dim-attr-header\",\"style\":{\"alignment\":1,\"font\":{\"italicFace\":true,\"boldFace\":false},\"isReadOnly\":true}},{\"key\":\"col-dim-attr-member\",\"style\":{\"font\":{\"italicFace\":true}}},{\"key\":\"data-region-title\",\"style\":{\"border\":{\"lineStyle\":1,\"type\":[-1],\"width\":2},\"line\":[{\"style\":1,\"color\":\"#3b6f9a\",\"width\":2,\"position\":1}]}},{\"key\":\"repeat-member-name\",\"style\":{\"isReadOnly\":true}},{\"key\":\"beta-table-data-region-title\",\"style\":{\"border\":{\"lineStyle\":1,\"type\":[-4],\"width\":1},\"line\":[{\"style\":1,\"color\":\"#e6e7e8\",\"width\":1,\"position\":1}]}},{\"key\":\"row-dim-attr-member\",\"style\":{\"font\":{\"italicFace\":true}}},{\"key\":\"col-total\",\"style\":{\"font\":{\"boldFace\":false}}},{\"key\":\"row-total\",\"style\":{\"font\":{\"boldFace\":false}}}],\"resultNavConfig\":{\"offsetRows\":0,\"offsetColumns\":0,\"maxRows\":500,\"maxColumns\":60,\"isAspectRatio\":true,\"isDefault\":true},\"initialUQMExternalState\":{\"drills\":[],\"hierarchyLevels\":[],\"hierarchyOptions\":[{\"entityId\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"}]\",\"showLeavesOnly\":false,\"hasTimeDependentHierarchies\":false,\"hasVersionDependentHierarchies\":false}],\"ranks\":[],\"sorts\":[],\"topEntries\":[],\"usedMeasures\":[\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"},{\\\"measureId\\\":\\\"COGS_GC\\\"}]\"],\"usedSecondaryMeasures\":[],\"usedDimensions\":{\"rowAxis\":[],\"columnAxis\":[\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"}]\"],\"filterDimensions\":[\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"}]\"]},\"maxRows\":500,\"offsetRows\":0,\"maxColumns\":60,\"offsetColumns\":0,\"totals\":[{\"entityId\":\"[{\\\"datasetId\\\":\\\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\\\"},{\\\"dimensionId\\\":\\\"CustomDimension1\\\"}]\",\"enabled\":false,\"useAlways\":false}],\"resultAlignment\":{\"ROWS\":1},\"hasNodeCondensation\":false},\"usedFieldSelection\":{\"usedMeasureFieldSelection\":{},\"usedMultiMeasureFieldSelection\":{}}}}],\"styleLib\":{\"key\":\"styleLib_16912196470923\",\"syncUpdateTime\":1691219647153,\"styles\":[{\"verticalAlignment\":1,\"alignment\":-1,\"name\":\"Default\",\"isDefault\":true,\"key\":\"16912196471536\",\"wordWrap\":false,\"isNone\":false,\"isUpdatedByUser\":true,\"fill\":\"transparent\",\"number\":{\"dataRegionFormat\":{},\"category\":4,\"typeSettings\":[{},{\"decimalPlaces\":2,\"currencyUnit\":{\"suffix\":\"$\"}},{\"decimalPlaces\":2,\"currencyUnit\":{\"suffix\":\"$\"}},{\"decimalPlaces\":2,\"currencyUnit\":{\"suffix\":\"$\"}},{}]},\"padding\":{\"left\":0,\"right\":0},\"cellChartSetting\":{\"chartType\":\"bar\",\"chartSetting\":{\"axisLineColor\":\"#000000\",\"dataLabelVisibility\":true}},\"border\":{\"lineStyle\":1,\"type\":[-1],\"width\":2},\"font\":{\"size\":13,\"type\":\"'72-Web'\",\"color\":\"rgb(88, 89, 91)\"},\"titleFont\":{\"color\":\"rgb(88, 89, 91)\",\"type\":\"'72-Web'\"},\"subtitleFont\":{\"color\":\"rgb(88, 89, 91)\",\"type\":\"'72-Web'\"}}],\"stylesMeta\":{\"stylesKeyHashMap\":{\"16912196471536\":{\"index\":0,\"hash\":\"1503218918\",\"refCount\":1}},\"styleHashMap\":{\"1503218918\":\"16912196471536\"}}},\"showGrid\":false,\"showTableHeaders\":false,\"showFreezeLines\":true,\"resizeMode\":\"dynamic\",\"availableCustomRows\":-1,\"availableCustomColumns\":-1,\"defaultStylingTemplate\":\"tablestyle\",\"defaultThresholdStyle\":0,\"verticalAutoresize\":false,\"tableStyleKey\":\"16912196471536\",\"disableEdit\":false,\"lastContainerHeight\":384,\"lastContainerWidth\":886,\"userDefinedColumnWidths\":[{\"index\":0,\"size\":247},{\"index\":1,\"size\":212},{\"index\":2,\"size\":154},{\"index\":3,\"size\":261}],\"columns\":[{\"size\":874}],\"rows\":[{\"size\":35},{\"size\":35},{\"size\":35},{\"size\":35},{\"size\":35},{\"size\":35},{\"size\":35},{\"size\":35},{\"size\":35},{\"size\":35},{\"size\":35},{\"size\":35},{\"size\":35},{\"size\":35},{\"size\":35}],\"titleHasDynamicText\":false,\"adhocStyleRules\":\"[]\"}},\"datasets\":[\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\"]},{\"id\":\"6e8b7961-9994-4bfd-bce6-e1ace133f6f5:fieldSelection\",\"type\":\"fieldSelection\",\"entities\":[],\"version\":\"1.0\"},{\"id\":\"82c14954-fb2c-4f28-af20-aaab9eed890e\",\"entities\":[],\"type\":\"uqmCustomCurrentDateEntityType\",\"version\":\"4.6\"},{\"version\":\"2.0\",\"type\":\"predictiveContainer\",\"data\":{\"workflows\":{}},\"id\":\"c8670101-6883-486c-bc88-d7a8d3c02f5b\"},{\"id\":\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\",\"type\":\"dataset\",\"data\":{\"metadata\":{\"id\":{\"type\":\"CUBE\",\"name\":\"Cum09400ha9q67vbn8c0o13soj\",\"package\":\"t.K.Cum09400ha9q67vbn8c0o13soj\"},\"description\":\"Rchling_Analytical_Model3\",\"shortDescription\":\"Rchling_Analytical_Model3\",\"owner\":\"[REMOVED]\",\"changedBy\":\"[REMOVED]\",\"version\":0,\"tmCreated\":\"2023-08-09T07:23:56.641Z\",\"tmModified\":\"2023-08-09T07:23:56.641Z\",\"isEmbedded\":true,\"isPrivate\":false,\"parentId\":{\"type\":\"STORY\",\"name\":\"179AF700C1F6054D4DB416C623EE5D2B\",\"package\":\"t.K\"}},\"model\":{\"id\":{\"type\":\"CUBE\",\"name\":\"Cum09400ha9q67vbn8c0o13soj\",\"package\":\"t.K.Cum09400ha9q67vbn8c0o13soj\"},\"auth\":{\"assign\":true,\"read\":true,\"update\":true,\"delete\":true,\"create_doc\":true,\"create_folder\":true,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":true,\"maintain\":true},\"data\":{\"id\":\"t.K.Cum09400ha9q67vbn8c0o13soj:Cum09400ha9q67vbn8c0o13soj\",\"descriptions\":{\"en_UK\":\"Rchling_Analytical_Model3\"},\"name\":\"Cum09400ha9q67vbn8c0o13soj\",\"type\":\"Analytic\",\"mode\":\"integrated\",\"status\":\"valid\",\"secured\":false,\"packageName\":\"t.K.Cum09400ha9q67vbn8c0o13soj\",\"enableDataAudit\":false,\"rate\":\"\",\"defaultCurrency\":\"\",\"description\":\"Rchling_Analytical_Model3\",\"currencyDimension\":\"\",\"dataLockingEnabled\":false,\"dataExportRestricted\":false,\"planningTimeDimension\":\"\",\"currencyConversionTimeDimension\":\"\",\"dimensions\":[],\"extendedDimensions\":[],\"measures\":[],\"sources\":[{\"objectName\":\"Rchling_Analytical_Model\",\"schemaName\":\"BU_SINGER\",\"objectType\":\"InAModel\",\"packageName\":\"\",\"origin\":\"\",\"connectionName\":\"DWCLive\"}],\"displayName\":\"Rchling_Analytical_Model3\",\"capability\":{\"addDimensions\":true,\"originBPC\":false,\"ctEnabled\":false,\"preConvertedCurrency\":false,\"simpleColumnNames\":false,\"automaticWriteBack\":false,\"nlqIndexingEnabled\":false,\"hasDatasetSource\":false,\"hasUserDefinedMeasures\":true,\"virtualVersion\":false,\"hasCustomSolveOrder\":false,\"useOlapView\":true,\"exposeCubeDimProperties\":false,\"legacyExport\":false,\"expensiveModel\":false,\"useCubeMasterdataView\":false,\"isDatasetModel\":false,\"optimizeBWQueryPerformance\":false,\"bwMinimizedAttributes\":false,\"loadHierarchiesIndependentOfModelMetadata\":false},\"DataSource\":{\"Type\":\"InAModel\",\"SchemaName\":\"BU_SINGER\",\"ObjectName\":\"Rchling_Analytical_Model\",\"System\":\"DWCLive\"},\"translation\":{\"enabled\":false,\"status\":\"NOT_TRANSLATED\",\"originalLanguage\":\"en_UK\",\"languages\":[]},\"dimensionValidationRules\":false,\"leadingStructure\":\"\",\"hints\":[],\"repositoryId\":null,\"hierarchies\":[],\"visualizations\":{},\"dimensionMapping\":[],\"isRemote\":true,\"linkedCubes\":{},\"lastUpdated\":\"2023-08-09T07:23:56.653Z\",\"planningFeatures\":{},\"isSample\":false,\"isTemporary\":false,\"shortDescription\":\"Rchling_Analytical_Model3\",\"ancestorPath\":[{\"resourceId\":\"PUBLIC\",\"access\":\"[REMOVED]\",\"accessExt\":\"[REMOVED]\",\"name\":\"PUBLIC\",\"sharedToAny\":true,\"auth\":{\"assign\":false,\"read\":true,\"update\":false,\"delete\":false,\"create_doc\":false,\"create_folder\":false,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":false},\"canShare\":false,\"shared\":true},{\"resourceId\":\"99D72F2C25FC0AD1A14DFB82E881C61\",\"access\":\"[REMOVED]\",\"accessExt\":\"[REMOVED]\",\"name\":\"INTERN\",\"sharedToAny\":true,\"auth\":{\"assign\":false,\"read\":true,\"update\":false,\"delete\":false,\"create_doc\":false,\"create_folder\":false,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":false},\"canShare\":false,\"shared\":true},{\"resourceId\":\"676002F6BC88969737BFF6EDCF632DDE\",\"access\":\"[REMOVED]\",\"accessExt\":\"[REMOVED]\",\"name\":\"Business Units\",\"sharedToAny\":true,\"auth\":{\"assign\":false,\"read\":true,\"update\":false,\"delete\":false,\"create_doc\":false,\"create_folder\":false,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":false},\"canShare\":false,\"shared\":true},{\"resourceId\":\"7AA002F61C098C9D73400262C47298A2\",\"access\":\"[REMOVED]\",\"accessExt\":\"[REMOVED]\",\"name\":\"BU Singer\",\"sharedToAny\":true,\"auth\":{\"assign\":true,\"read\":true,\"update\":true,\"delete\":true,\"create_doc\":true,\"create_folder\":true,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":true,\"maintain\":true},\"canShare\":false,\"shared\":true},{\"resourceId\":\"2F2A1B0369120B7355CFABCEC56B6B07\",\"access\":\"[REMOVED]\",\"accessExt\":\"[REMOVED]\",\"name\":\"David Wurm\",\"sharedToAny\":true,\"auth\":{\"assign\":true,\"read\":true,\"update\":true,\"delete\":true,\"create_doc\":true,\"create_folder\":true,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":true,\"maintain\":true},\"canShare\":true,\"shared\":true},{\"resourceId\":\"D7A855046F3DB9DA7D9632256B9B338B\",\"access\":\"[REMOVED]\",\"accessExt\":\"[REMOVED]\",\"name\":\"Business Development\",\"sharedToAny\":true,\"auth\":{\"assign\":true,\"read\":true,\"update\":true,\"delete\":true,\"create_doc\":true,\"create_folder\":true,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":true,\"maintain\":true},\"canShare\":true,\"shared\":true},{\"resourceId\":\"F3320D046F386F704F6D26AE2DFDA980\",\"access\":\"[REMOVED]\",\"accessExt\":\"[REMOVED]\",\"name\":\"Custom Widget\",\"sharedToAny\":true,\"auth\":{\"assign\":true,\"read\":true,\"update\":true,\"delete\":true,\"create_doc\":true,\"create_folder\":true,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":true,\"maintain\":true},\"canShare\":true,\"shared\":true},{\"resourceId\":\"179AF700C1F6054D4DB416C623EE5D2B\",\"access\":\"[REMOVED]\",\"accessExt\":\"[REMOVED]\",\"name\":\"DSP_CHANGE_CONNECTION\",\"sharedToAny\":true,\"auth\":{\"assign\":true,\"read\":true,\"update\":true,\"delete\":true,\"create_doc\":true,\"create_folder\":true,\"copy\":true,\"comment_view\":true,\"comment_add\":true,\"comment_delete\":true},\"canShare\":true,\"shared\":true}]},\"metadata\":{\"id\":{\"type\":\"CUBE\",\"name\":\"Cum09400ha9q67vbn8c0o13soj\",\"package\":\"t.K.Cum09400ha9q67vbn8c0o13soj\"},\"description\":\"Rchling_Analytical_Model3\",\"shortDescription\":\"Rchling_Analytical_Model3\",\"owner\":\"[REMOVED]\",\"changedBy\":\"[REMOVED]\",\"version\":0,\"tmCreated\":\"2023-08-09T07:23:56.641Z\",\"tmModified\":\"2023-08-09T07:23:56.641Z\",\"isEmbedded\":true,\"isPrivate\":false,\"parentId\":{\"type\":\"STORY\",\"name\":\"179AF700C1F6054D4DB416C623EE5D2B\",\"package\":\"t.K\"}},\"dependentObjects\":[],\"subObjects\":[],\"subObjectTypes\":[],\"resourceId\":\"Cum09400ha9q67vbn8c0o13soj\"},\"isPrivate\":true,\"packageName\":\"t.K\",\"isRemote\":true,\"id\":\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\",\"originalViewInfo\":{\"spaceId\":\"D630D8A077E743F11700250AA24F1099\",\"viewId\":\"51C49CD57CCC7D6A1800AE22994D1C0C\"},\"modelId\":\"Cum09400ha9q67vbn8c0o13soj\",\"systemType\":\"HANA\"},\"promptValues\":null},{\"datasetId\":\"view:[_SYS_BIC][t.K.Cum09400ha9q67vbn8c0o13soj][Cum09400ha9q67vbn8c0o13soj]\",\"alias\":\"\\\"Cum09400ha9q67vbn8c0o13soj\\\"\",\"type\":\"datasetAlias\",\"id\":\"e95e49d2-2047-4312-bd13-76693ab0a5e1\"}],\"optimizedDesignEnabled\":true,\"folder\":\"PRIVATE\",\"title\":\"DSP_CHANGE_CONNECTION\",\"optimizedEnabled\":true,\"optimizedBlockingUnsupportedFeatures\":false,\"bookmarkSettings\":{\"keepLastValueForDynamicVariable\":true,\"overrideDefaultSettings\":true,\"customDialogLicense\":true},\"mobileSupportCanvasPage\":false}",
                                        "mobileSupport": 0,
                                        "updateOpt": {
                                            "dataChangeInsightsSupport": {
                                                "value": 0
                                            },
                                            "enhancedProperties": {
                                                "STORY_OPTIMIZED_INFO": "VIEW_EDIT_STORY2"
                                            },
                                            "contentOnly": true,
                                            "ignoreVersion": true
                                            // "localVer": 14
                                        },
                                        "fetchOpt": {
                                            "bIncDependency": false,
                                            "bIncSubItems": false
                                        }
                                    }
                                }
                            );
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
                                    info: "old: {old_value}",
                                    description: "new {new_value}"
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
                                    // var req = this.updateContent(that_.storyID).then(function (e) {
                                    //     content = JSON.parse(e.target.respnse);
                                    // });
                                    var storyRes = that_.contentLib.getResourcesEx(this._context);
                                    console.log(storyRes);
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
                                            that_.storyVersion = content.metadata.version;
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

                                        //updateStory(that_.resourceInfoStoryParentId, that_.resourceInfoStoryType, that_.resourceInfoStoryName, that_.resourceInfoStoryDescription, that_.resourceInfoStoryReplacedConn, that_.storyID);


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