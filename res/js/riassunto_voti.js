var debug;//DEBUG TODO

(function($) {

    //MODELS AND COLLECTIONS ============================================================
        //Giocatore MODEL
        var Giocatore = Backbone.Model.extend({
            giornate: undefined,

            defaults: {
                "ID": "",
                "Giocatore": "",
                "Ruolo": "",
                "Squadra": "",
                "disponibile": true
            },

            addGiornate: function(collection) {
                if (this.giornate == undefined)  {
                    this.giornate = new Giornate(collection);
                    this.creaMedia();
                }
            },

            creaMedia: function() {
                if (this.giornate != undefined) {
                    var obj = this.giornate.creaMedia();
                    this.set(obj);
                }
            }
        });

        //COLLECTION OF Giocatore
        var Giocatori = Backbone.Collection.extend({
            model: Giocatore,
            sortedBy: 'Giocatore',
            order: 1,
            lastSortedBy: 'Giocatore',
            lastOrder: 1,

            comparator: function(model1, model2) {
                var a = model1.get(this.sortedBy)!= undefined ? model1.get(this.sortedBy) : 0,
                    b = model2.get(this.sortedBy)!= undefined ? model2.get(this.sortedBy) : 0,
                    sorter = function(sortVal, order) {
                        switch (sortVal) {
                            case "voto":
                            case "votoTrend":
                            case "fanta":
                            case "fantaTrend":
                                if (order < 0)
                                    return (parseFloat(a) > parseFloat(b)) ? 1 : (parseFloat(a) == parseFloat(b)) ? 0 : -1;
                                else
                                    return (parseFloat(a) > parseFloat(b)) ? -1 : (parseFloat(a) == parseFloat(b)) ? 0 : 1;
                                break;
                            case "amm":
                            case "esp":
                            case "partite":
                            case "goal":
                            case "owngoal":
                            case "takengoal":
                            case "assist":
                            case "rigtrasf":
                            case "rigsba":
                            case "rigsub":
                            case "rigpar":
                                if (order < 0)
                                    return (parseInt(a) > parseInt(b)) ? 1 : (parseInt(a) == parseInt(b)) ? 0 : -1;
                                else
                                    return (parseInt(a) > parseInt(b)) ? -1 : (parseInt(a) == parseInt(b)) ? 0 : 1;
                                break;
                            case "ID":
                                if (order > 0)
                                    return (parseInt(a) > parseInt(b)) ? 1 : (parseInt(a) == parseInt(b)) ? 0 : -1;
                                else
                                    return (parseInt(a) > parseInt(b)) ? -1 : (parseInt(a) == parseInt(b)) ? 0 : 1;
                                break;
                            default: 
                                if (order > 0)
                                    return (a > b) ? 1 : (a == b) ? 0 : -1;
                                else
                                    return (a > b) ? -1 : (a == b) ? 0 : 1;
                                break;
                        }
                    },
                    resNew = sorter(this.sortedBy, this.order),
                    resOld = sorter(this.lastSortedBy, this.lastOrder);
                return (resNew != 0) ? resNew : resOld;
            },

            sortMe: function(by) {
                var tempOrder = (this.lastSortedBy == by) ? -1*this.lastOrder : 1;
                if (this.sortedBy != by) {
                    this.lastSortedBy = this.sortedBy;
                    this.lastOrder = this.order;
                    this.order = tempOrder;
                    this.sortedBy = by;
                } else {
                    this.order = -1*this.order;
                }
                this.sort();
            }
        });

        //Giornata MODEL
        var Giornata = Backbone.Model.extend({
            defaults: {
                "giornata": "",
                "voto": "",
                "fanta": "",
                "amm": "",
                "esp": "",
                "goal": "",
                "owngoal": "",
                "takengoal": "",
                "assist": "",
                "rigtrasf": "",
                "rigsba": "",
                "rigsub": "",
                "rigpar": ""
            }
        });

        //COLLECTION OF Giornate
        var Giornate = Backbone.Collection.extend({
            model: Giornata,

            comparator: function(g) {
                return parseInt(g.get("giornata"));
            },

            creaMedia: function() {
                var obj = {
                        partite: 0,
                        voto : 0,
                        votoTrend : 0,
                        fanta : 0,
                        fantaTrend: 0,
                        amm : 0,
                        esp : 0,
                        goal : 0,
                        owngoal : 0,
                        takengoal : 0,
                        assist : 0,
                        rigtrasf : 0,
                        rigsba : 0,
                        rigsub : 0,
                        rigpar : 0
                    },
                    count = 0;
                    conf = config.valutazioni,
                    models = this.models;

                for (var i=0, l=models.length; i<l; i++) {
                    var model = models[i],
                        voto = (model.get("voto") != "s.v.") ? parseFloat(model.get("voto")) : 6,
                        amm = (model.get("amm") == true) ? 1 : 0,
                        esp = (model.get("esp") == true) ? 1 : 0,
                        goal = (model.get("goal") != "") ? parseInt(model.get("goal")) : 0,
                        owngoal = (model.get("owngoal") != "") ? parseInt(model.get("owngoal")) : 0,
                        takengoal = (model.get("takengoal") != "") ? parseInt(model.get("takengoal")) : 0,
                        assist = (model.get("assist") != "") ? parseInt(model.get("assist")) : 0,
                        rigtrasf = (model.get("rigtrasf") != "") ? parseInt(model.get("rigtrasf")) : 0,
                        rigsba = (model.get("rigsba") != "") ? parseInt(model.get("rigsba")) : 0,
                        rigsub = (model.get("rigsub") != "") ? parseInt(model.get("rigsub")) : 0,
                        rigpar = (model.get("rigpar") != "") ? parseInt(model.get("rigpar")) : 0,
                        espamm = (esp > 0) ? (esp*conf.espulsione) : (amm*conf.ammonizione),//AMM OR ESP? DECIDE AND ASSIGN MALUS ACCORDINGLY
                        fanta = voto + espamm + (goal*conf.goal) + (owngoal*conf.autogoal) + (takengoal*conf.goal_subito) + (assist*conf.assist) + (rigsba*conf.rigore_sbagliato) + (rigpar*conf.rigore_parato);

                    model.set({ 'fanta': fanta });
                    obj.voto += voto;
                    obj.amm += amm;
                    obj.esp += esp;
                    obj.goal += goal;
                    obj.owngoal += owngoal;
                    obj.takengoal += takengoal;
                    obj.assist += assist;
                    obj.rigtrasf += rigtrasf;
                    obj.rigsba += rigsba;
                    obj.rigsub += rigsub;
                    obj.rigpar += rigpar;
                    obj.fanta += fanta;
                    count += 1;
                }

                obj.voto = (obj.voto/count).toFixed(2);
                obj.fanta = (obj.fanta/count).toFixed(2);
                obj.partite = count;

                //SET TRENDS
                obj.votoTrend = this.calculateTrend('voto');
                obj.fantaTrend = this.calculateTrend('fanta');

                return obj;
            },

            calculateTrend: function(char) {
                var votoArr = this.pluck(char),
                    l = votoArr.length,
                    result = 0,
                    Sx = 0,
                    Sy = 0,
                    Sxy = 0,
                    Sx2 = 0;

                if (l > 1) {
                    for(var i=0; i<l; i++){
                        var x = (isNaN(parseFloat(votoArr[i]))) ? 6 : parseFloat(votoArr[i]),
                            y = i+1;
                        Sx += x;
                        Sy += y;
                        Sxy += (x*y);
                        Sx2 += (x*x);
                    }
                    // Calculate slope
                    if ((l*Sxy - Sx*Sy) != 0 && (l*Sx2 - Sx*Sx) != 0) {
                        result = (l*Sxy - Sx*Sy) / (l*Sx2 - Sx*Sx);
                        result = Math.round(result * 100) / 100;
                    } else {
                        result = 0;
                    }
                    return result;
                } else {
                    return 0;
                }
            }
        });
    //===================================================================================

    //VIEWS =============================================================================
        //VIEW TABLE PLAYERS (View of Collection Giocatori filtered by App)
        var TabellaGiocatori = Backbone.View.extend({
            templateId: '#tabella-ruolo',
            tableBody: 'tbody',
            ruolo: undefined,
            rowArray: [],

            events: {
                "click th.list-order": "sortTable"
            },

            initialize: function() {
                this.app = this.options.app;
                this.ruolo = this.options.ruolo;
                this.collection.on("reset", this.fillTable, this);
                this.template = _.template($(this.templateId).html());
                this.render();
            },

            render: function() {
                this.setElement($(this.template({ ruolo: this.ruolo })));
                this.fillTable();
                return this;
            },

            emptyTable: function() {
                if (this.rowArray.length > 0) {
                    _(this.rowArray).each(function(row) {
                        if (row.showingGiornate == true) 
                            row.hideGiornate();
                        $(row).detach();//USING DETACH TO MAINTAIN EVENTS ON REMOVED VIEWS
                    }, this);
                }
            },

            fillTable: function() {
                this.emptyTable();
                var list = this.collection.models;
                _(list).each(function(g) {
                    var row,
                        rowPos = this.checkRowPresence(g);
                    if (rowPos < 0) {
                        row = new RigaGiocatore({ model: g, app: this.app });
                        this.rowArray.push(row);
                    } else {
                        row = this.rowArray[rowPos];
                    }
                    this.attach($(this.$(this.tableBody)), row);
                }, this);
                this.checkOrder();
            },

            sortTable: function(e) {
                var by = this.$(e.target).attr('rel');
                this.collection.sortMe(by);
            },

            checkOrder: function() {
                var sortedBy = this.collection.sortedBy,
                    order = this.collection.order,
                    item = this.$('th.'+sortedBy+' i'),
                    lastSortedBy = this.collection.lastSortedBy,
                    lastOrder = this.collection.lastOrder,
                    lastItem = this.$('th.'+lastSortedBy+' i');

                this.$('th.list-order i').removeClass('icon-chevron-down').removeClass('icon-chevron-up').addClass('icon-chevron-right');

                if (order > 0)
                    item.removeClass('icon-chevron-right').removeClass('icon-chevron-up').addClass('icon-chevron-down');
                else
                    item.removeClass('icon-chevron-right').removeClass('icon-chevron-down').addClass('icon-chevron-up');

                //UNCOMMENT TO SHOW LAST FILTER ORDERING
                // if (lastOrder > 0)
                //     lastItem.removeClass('icon-chevron-right').removeClass('icon-chevron-up').addClass('icon-chevron-down');
                // else
                //     lastItem.removeClass('icon-chevron-right').removeClass('icon-chevron-down').addClass('icon-chevron-up');
            },

            //SEARCH FOR INDEX OF MODEL IN ARRAY OF TABLE ROWS ALREADY GENERATED
            checkRowPresence: function(model) {
                var resp = -1;
                for (var i=0, l=this.rowArray.length; i<l; i++) {
                    var row = this.rowArray[i];
                    if (row.model == model) {
                        resp = i;
                        break;
                    }
                }
                return resp;
            },

            filterCollection: function(filters) {
                for (var i=0, l=this.rowArray.length; i<l; i++) {
                    var row = this.rowArray[i],
                        model = row.model,
                        show = true;

                    row.showMe();

                    for (var p in filters) {
                        var filter = p.toString(),
                            value = filters[p],
                            filterArr = ['Giocatore','ID','Ruolo','Squadra','amm','assist','esp','fanta','goal','owngoal','partite','rigpar','rigsba','rigsub','rigtrasf','takengoal','voto'];

                        if (filterArr.indexOf(filter) >= 0) {
                            //SWITCH FOR SPECIAL FILTER CASES
                            switch (filter) {
                                //PLAYER NAME
                                case 'Giocatore':
                                    /* PERMIT PARTIAL MATCHES AND MULTIPLE VALUES */
                                    (value.indexOf(',') >= 0) ? value = value.toLowerCase().split(',') : value = [value.toLowerCase()];
                                    show = false;
                                    for (var ii=0, ll=value.length; ii<ll; ii++) {
                                        var str = value[ii];
                                        if (model.get(filter).toLowerCase().indexOf(str) >= 0) {
                                            show = true;
                                        }
                                    }
                                    if (model.get(filter) == undefined) {
                                        show = false;
                                    }
                                    break;
                                //RUOLO
                                case 'Ruolo':
                                case 'Squadra':
                                case 'ID': //ID IS TREATED AS STRING
                                    /* PERMIT MULTIPLE VALUES */
                                    (value.indexOf(',') >= 0) ? value = value.toLowerCase().split(',') : value = [value.toLowerCase()];
                                    if (value.indexOf(model.get(filter).toLowerCase()) < 0 && value.indexOf('all') < 0) {
                                        show = false;
                                    } else if (model.get(filter) == undefined && value.indexOf('all') < 0) {
                                        show = false;
                                    }
                                    break;
                                //ALL OTHER CASES
                                default:
                                    switch (typeof value) {
                                        case 'number':
                                            if (model.get(filter) < value && value !== 0) {
                                                show = false;
                                            } else if (model.get(filter) == undefined && value != 0) {
                                                show = false;
                                            }
                                            break;
                                        default:
                                            value = value.toLowerCase();
                                            if (model.get(filter).toLowerCase() != value && value != 'all') {
                                                show = false;
                                            } else if (model.get(filter) == undefined && value != 'all') {
                                                show = false;
                                            }
                                            break;
                                    }
                                    break;
                            } 
                        }
                    }

                    (show) ? row.showMe() : row.hideMe();
                }

                this.checkEmpty();
            },

            checkEmpty: function() {
                this.showMe(); //done to check tr visibility (they would all be not visible if el is not visible)
                var children = this.$('tbody tr:visible');
                if (children.length <= 0) {
                    this.hideMe();
                } else {
                    this.showMe();
                }
            },

            showMe: function() {
                this.$el.show();
            },

            hideMe: function() {
                this.$el.hide();
            },

            attach: function(container, view) {
                container.append(view.$el);
            }
        });

        //VIEW PLAYER ROW (View of Model Giocatore used by TabellaGiocatori)
        var RigaGiocatore = Backbone.View.extend({
            templateId: '#riga-giocatore',
            rendered: false,
            showingGiornate: false,
            giornateArray: [],

            events: {
                "click td.clickable": "showGiornate",
                "change td.disponibile input[type=checkbox]": "changeDisponibile"
            },

            initialize: function() {
                this.app = this.options.app;
                this.model.on("change:voto", this.refill, this);
                this.model.on("change:disponibile", this.checkRowError, this);
                this.template = _.template($(this.templateId).html());
                this.render();
            },

            render: function() {
                if (this.rendered == false) {
                    this.setElement($(this.template({ 
                        disponibile: this.model.get('disponibile'), 
                        id: this.model.get('ID'), 
                        name: this.model.get('Giocatore'), 
                        team: this.model.get('Squadra'),
                        partite: this.model.get('partite') || "-",
                        voto: this.model.get('voto') || "-",
                        votoTrend:  this.model.get('votoTrend') || "-",
                        fanta: this.model.get('fanta') || "-",
                        fantaTrend:  this.model.get('fantaTrend') || "-",
                        amm: this.model.get('amm') || "-",
                        esp: this.model.get('esp') || "-",
                        goal: this.model.get('goal') || "-",
                        owngoal: this.model.get('owngoal') || "-",
                        takengoal: this.model.get('takengoal') || "-",
                        assist: this.model.get('assist') || "-",
                        rigtrasf: this.model.get('rigtrasf') || "-",
                        rigsba: this.model.get('rigsba') || "-",
                        rigsub: this.model.get('rigsub') || "-",
                        rigpar: this.model.get('rigpar') || "-"
                    })));
                } else {
                    var attr = this.model.toJSON();
                    for (var k in attr) {
                        var key = k.toString(),
                            val = attr[k];

                        if (key == 'disponibile') {
                            this.$('.'+key).find('input[type=checkbox]').prop('checked', val); 
                        } else if (key == 'votoTrend' || key == 'fantaTrend') {
                            var snippet = '';
                            if (val == 0) {
                                snippet = '-';
                            } else if (val < 0) {
                                if (val < -1.5) {
                                    snippet = '<i class="trend trend-double trend-dn" title="Prestazioni in grande calo"></i>';
                                } else {
                                    snippet = '<i class="trend trend-dn" title="Prestazioni in calo"></i>';
                                }
                            } else if (val > 0) {
                                if (val > 1.5) {
                                    snippet = '<i class="trend trend-double trend-up" title="Prestazioni in grande ascesa"></i>';
                                } else {
                                    snippet = '<i class="trend trend-up" title="Prestazioni in ascesa"></i>';
                                }
                            }
                            this.$('.'+key).html(snippet);
                        } else {
                            this.$('.'+key).html(val);
                        }
                        if (key == 'voto' || key == 'fanta') {
                            var num = parseFloat(val),
                                col = '#037000',
                                txt = '#fff';
                            if (num < 4) {
                                col = '#6B0000';
                            } else if (num >= 4 && num < 4.5) {
                                col = '#D11212';
                            } else if (num >= 4.5 && num < 5) {
                                col = '#F26957';
                            } else if (num >= 5 && num < 5.5) {
                                col = '#F7E18A';
                                txt = '#333';
                            } else if (num >= 5.5 && num < 6) {
                                col = '#F4F489';
                                txt = '#333';
                            } else if (num >= 6 && num < 6.5) {
                                col = '#89D64F';
                                txt = '#333';
                            } else if (num >= 6.5 && num < 7) {
                                col = '#5EB21E';
                            } else if (num >= 7 && num < 8) {
                                col = '#059900';
                            }

                            this.$('.'+key).css({ 'background-color': col, 'color': txt });
                        }
                    }
                    if (this.model.giornate != undefined) this.$el.css({ 'cursor': 'pointer' });
                    this.checkRowError();
                }
                this.rendered = true;
                return this;
            },

            showGiornate: function() {
                if (this.showingGiornate == false) {
                    this.giornateArray = [];
                    if (this.model.giornate != undefined) {
                        var giornate = this.model.giornate,
                            list = giornate.models;
                        _(list).each(function(g) {
                            var row = new RigaGiornata({ model: g });
                            this.giornateArray.push(row);
                        }, this);
                        this.insertGiornate();
                    }
                } else {
                    this.hideGiornate();
                }
            },

            insertGiornate: function() {
                this.giornateArray.reverse();
                for (var i=0, l=this.giornateArray.length; i<l; i++) {
                    var row = this.giornateArray[i];
                    this.$el.after(row.$el);
                }
                this.showingGiornate = true;
            },

            hideGiornate: function() {
                for (var i=0, l=this.giornateArray.length; i<l; i++) {
                    var row = this.giornateArray[i];
                    row.remove();
                }
                this.giornateArray = [];
                this.showingGiornate = false;
            },

            showMe: function() {
                this.$el.show();
            },

            hideMe: function() {
                this.hideGiornate();
                this.$el.hide();
            },

            refill: function() {
                this.render();
            },

            changeDisponibile: function() {
                var data = JSON.parse(localStorage.getItem('disponibili')),
                    giocatore = this.model.get('Giocatore'),
                    i = data.indexOf(giocatore);

                this.model.set('disponibile', !this.model.get('disponibile'));

                if (this.model.get('disponibile') == false) {
                    if (i < 0) {
                        data.push(giocatore.toString());
                        localStorage.setItem('disponibili', JSON.stringify(data));
                        this.app.loadDisponibili();
                    }
                } else {
                    if (i >= 0) {
                        data.splice(i, 1);
                        localStorage.setItem('disponibili', JSON.stringify(data));
                        this.app.loadDisponibili();
                    }
                }
            },

            checkRowError: function() {
                if (this.model.get('disponibile') == true) {
                    this.$el.removeClass('error');
                    this.$('.disponibile').find('input[type=checkbox]').prop('checked', true); 
                } else {
                    this.$el.addClass('error');
                    this.$('.disponibile').find('input[type=checkbox]').prop('checked', false); 
                }
            }
        });

        //VIEW PLAYER ROW (View of Model Giocatore used by TabellaGiocatori)
        var RigaGiornata = Backbone.View.extend({
            templateId: '#riga-giornata',

            initialize: function() {
                this.template = _.template($(this.templateId).html());
                this.render();
            },

            render: function() {
                this.setElement($(this.template({
                    giornata: this.model.get('giornata') || "-",
                    voto: this.model.get('voto') || "-",
                    fanta: this.model.get('fanta') || "-",
                    amm: (this.model.get('amm')) == true ? 1 : 0 || "-",
                    esp: (this.model.get('esp')) == true ? 1 : 0 || "-",
                    goal: this.model.get('goal') || "-",
                    owngoal: this.model.get('owngoal') || "-",
                    takengoal: this.model.get('takengoal') || "-",
                    assist: this.model.get('assist') || "-",
                    rigtrasf: this.model.get('rigtrasf') || "-",
                    rigsba: this.model.get('rigsba') || "-",
                    rigsub: this.model.get('rigsub') || "-",
                    rigpar: this.model.get('rigpar') || "-"
                })));
                var tempArr = [this.$('.voto'), this.$('.fanta')];
                for (var i=0, l=tempArr.length;i<l;i++) {
                    var key = tempArr[i],
                        num = key.html() != 's.v.' ? parseFloat(key.html()) : 6,
                        col = '#024300',
                        txt = '#fff';
                    if (num < 4) {
                        col = '#400000';
                    } else if (num >= 4 && num < 4.5) {
                        col = '#7d0b0b';
                    } else if (num >= 4.5 && num < 5) {
                        col = '#913f34';
                    } else if (num >= 5 && num < 5.5) {
                        col = '#948753';
                    } else if (num >= 5.5 && num < 6) {
                        col = '#929252';
                    } else if (num >= 6 && num < 6.5) {
                        col = '#52802f';
                    } else if (num >= 6.5 && num < 7) {
                        col = '#386b12';
                    } else if (num >= 7 && num < 8) {
                        col = '#035c00';
                    }

                    key.css({ 'background-color': col, 'color': txt });
                }
                return this;
            }
        });

        //VIEW FILTERS (View of Collection Giocatori used by App)
        var FiltriView = Backbone.View.extend({
            templateId: '#filtri-template',
            rendered: false,
            formIDs: ['giocatore', 'ruolo', 'squadra', 'partite', 'voto', 'fanta', 'goal'],
            fields: [],
            optionId: '#filtri-option',
            textareaId : '#display-disponibili',
            textarea: undefined,
            savedFiltersId: '#filtri-salvati',
            savedFilterTemplate: '#filtro-salvato',
            savedFilters: undefined,
            filters: JSON.parse(localStorage.getItem('filters')),

            events: {
                'submit #filtri': 'submitFilter',
                'click #filtri-submit': 'submitFilter',
                'click #check-disponibili': 'controllaDisponibili',
                'click #force-disponibili': 'controllaDisponibiliForce',
                'click #import-disponibili': 'importaDisponibili',
                'click #filtri-save': 'salvaFiltri'
            },

            initialize: function() {
                this.app = this.options.app;
                this.template = _.template($(this.templateId).html());
                this.render();
            },

            render: function() {
                this.setElement($(this.template()));
                this.initFields();
                if (this.textarea == undefined) this.textarea = this.$(this.textareaId);
                if (this.savedFilters == undefined) this.savedFilters = this.$(this.savedFiltersId);
                this.updateSavedFilters();
                this.rendered = true;
                return this;
            },

            initFields: function() {
                for (var i=0, l=this.formIDs.length; i<l; i++) {
                    var name = this.formIDs[i],
                        id = '#filtri-'+name;

                    if (this[name] == undefined) {
                        this[name] = this.$(id);
                        this.setupField(name);
                        this.fields.push(this[name]);
                    }
                }
            },

            setupField: function(name) {
                switch (name) {
                    case 'giocatore':
                        break;
                    case 'ruolo':
                    case 'squadra':
                        var capName = name.charAt(0).toUpperCase() + name.slice(1),
                            arr = this.collection.pluck(capName),
                            options = [],
                            that = this;

                        //REMOVE DUPLICATE VALUES FROM ARRAY
                        $.each(arr, function(i, t){
                            if($.inArray(t, options) === -1) options.push(t);
                        });

                        $.each(options, function(i, t){
                            that[name].append('<option value="'+t+'">'+t+'</option>');
                        });

                        this[name].select2({
                            containerCss: {
                                'padding': '0 0 10px',
                                'width': '200px'
                            }
                        });
                        break;
                    default:
                        break;
                }
            },

            submitFilter: function(e) {
                e.preventDefault();
                var queryString = 'filter';
                for (var i=0, l=this.fields.length; i<l; i++) {
                    var field = this.fields[i],
                        attr = field.attr('rel')
                        val = (field.val() !== '') ? field.val() : field.attr('data-default-value'),
                        conn = (i == 0) ? '?' : '&';

                    val = (val == null) ? field.attr('data-default-value') : val;
                    queryString += conn + attr + '=' + val;
                }
                this.app.router.navigate(queryString, {trigger: true});
            },

            salvaFiltri: function(e) {
                e.preventDefault();
                var url = window.location.hash,
                    testerKeys = /(?:(?:\?|\&)([^\&]+)\=)/g,
                    testerVals = /(?:\=([^\&]*)(?:$|\&))/g,
                    keys = [],
                    values = [],
                    obj = {},
                    filterNameField = this.$('#nome-filtro-save'),
                    filter = filterNameField.val(),
                    match = '',
                    decodeTags = function(arr, arg) {
                        arr.push(arg[1]);
                    },
                    dupe = false,
                    dupeMsg = '';

                while (match = testerKeys.exec(url)) {
                    decodeTags(keys, match);
                }
                while (match = testerVals.exec(url)) {
                    decodeTags(values, match);
                }

                if (filter == '') {
                    filterNameField.parents('.control-group').addClass('error');
                    this.$('#alert-placeholder').empty();
                    this.$('#alert-placeholder').append((_.template($('#nome-filtro-alert').html())({ message: 'Inserisci un nome per il filtro.' })));
                } else {
                    filterNameField.parents('.control-group').removeClass('error');
                    this.$('#alert-placeholder').empty();
                    if (url != '') {
                        this.$('#alert-placeholder').empty();
                        obj.url = url;
                        obj.filtro = filter;

                        if (this.filters == undefined) {
                            this.filters = [];
                        }

                        for (var ii=0, ll=this.filters.length; ii<ll; ii++) {
                            var o = this.filters[ii];
                            if (o.url == obj.url) {
                                dupe = true;
                                dupeMsg = 'Il filtro &egrave; gi&agrave; presente!';
                                break;
                            }
                            if (o.filtro == obj.filtro) {
                                dupe = true;
                                dupeMsg = 'Questo nome &egrave; gi&agrave; stato utilizzato!';
                                break;
                            }
                        }
                        if (dupe == false) {
                            this.$('#alert-placeholder').empty();
                            this.filters.push(obj);
                            localStorage.setItem('filters', JSON.stringify(this.filters));
                            this.updateSavedFilters();
                        } else {
                            this.$('#alert-placeholder').empty();
                            this.$('#alert-placeholder').append((_.template($('#nome-filtro-alert').html())({ message: dupeMsg })));
                        }
                    } else {
                        this.$('#alert-placeholder').empty();
                        this.$('#alert-placeholder').append((_.template($('#nome-filtro-alert').html())({ message: 'La lista non è filtrata al momento.' })));
                    }
                }
            },

            updateSavedFilters: function() {
                if (this.filters == undefined) {
                    this.filters = [];
                } else {
                    this.filters = JSON.parse(localStorage.getItem('filters'));
                }

                if (this.filters.length <= 0) {
                    this.savedFilters.hide();
                } else {
                    var tpl = _.template($(this.savedFilterTemplate).html());
                    this.savedFilters.find('.filtri-btns').empty();
                    for (var i=0, l=this.filters.length; i<l; i++) {
                        var obj = this.filters[i],
                            btn = $(tpl(obj));
                        this.savedFilters.find('.filtri-btns').append(btn);
                    }
                    this.savedFilters.show();
                }
            },

            controllaDisponibili: function(e) {
                var app = this.app;
                app.loadDisponibili();
            },

            controllaDisponibiliForce: function(e) {
                var app = this.app;
                app.loadDisponibili(true);
            },

            importaDisponibili: function(e) {
                var app = this.app;
                app.importaDisponibili(this.textarea);
            },

            printDisponibili: function(data) {
                this.textarea.val(data);
            }
        });
    //===================================================================================

    //ROUTER=============================================================================
        //MAIN ROUTER
        var MainRouter = Backbone.Router.extend({
            app: undefined,

            routes: {
                'filter': 'filter'
            },

            initialize: function(options) {
                this.app = options.app;
            },

            filter: function(params) {
                if (this.app.voti != undefined) {
                    for (var p in params) {
                        var key = p.toString(),
                            value = params[p];

                        function isNumber(n) {
                            return !isNaN(parseFloat(n)) && isFinite(n);
                        }

                        if (isNumber(value)) {
                            if (value.indexOf('.') >= 0) {
                                value = parseFloat(value, 2);
                            } else {
                                value = parseInt(value, 10);
                            }
                        }

                        params[p] = value;
                    }
                    this.app.filterCollection(params);
                } else {
                    //AVOID FILTERING AS DATA IS NOT YET LOADED
                }
            }
        });
    //===================================================================================

    //MAIN APP===========================================================================
        //MAIN VIEW CONTROLLER
        var App = new (Backbone.View.extend({
            tabContainerId: '#tabella-giocatori',
            portieri: undefined,
            difensori: undefined,
            centrocampisti: undefined,
            attaccanti: undefined,
            voti: undefined,
            router: undefined,
            filtriId: '#filtri-placeholder',
            filtri: undefined,
            disponibili: localStorage.getItem('disponibili'),

            initialize: function() {
                this.router = new MainRouter({ app: this });
                debug = this;//DEUBG TODO
            },

            render: function() {
                if (this.portieri == undefined) {
                    this.portieri = new TabellaGiocatori({ collection: new Giocatori(this.filterList('Portieri')), ruolo: 'Portieri', app: this });
                } else {
                    this.portieri.render();
                }
                if (this.difensori == undefined) {
                    this.difensori = new TabellaGiocatori({ collection: new Giocatori(this.filterList('Difensori')), ruolo: 'Difensori', app: this });
                } else {
                    this.difensori.render();
                }
                if (this.centrocampisti == undefined) {
                    this.centrocampisti = new TabellaGiocatori({ collection: new Giocatori(this.filterList('Centrocampisti')), ruolo: 'Centrocampisti', app: this });
                } else {
                    this.centrocampisti.render();
                }
                if (this.attaccanti == undefined) {
                    this.attaccanti = new TabellaGiocatori({ collection: new Giocatori(this.filterList('Attaccanti')), ruolo: 'Attaccanti', app: this });
                } else {
                    this.attaccanti.render();
                }
                this.attach(this.$(this.tabContainerId), this.portieri);
                this.attach(this.$(this.tabContainerId), this.difensori);
                this.attach(this.$(this.tabContainerId), this.centrocampisti);
                this.attach(this.$(this.tabContainerId), this.attaccanti);
                this.loadData();
            },

            loadData: function(force) {
                force = force || false;
                if (this.voti === undefined || force == true) {
                    var that = this;
                    $.ajax({
                        url: "inc/lista_voti.js",
                        success: function(data, textStatus, jqXHR) {
                            that.voti = JSON.parse(data);
                            that.passData();
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            alert('Error retrieving information from server.')
                        }
                    });
                }
            },

            passData: function() {
                var voti = this.voti[0];

                for (var giocatore in voti) {

                    var models = this.collection.where({"Giocatore": giocatore});
                    for (var i=0, l=models.length; i<l; i++) {
                        var model = models[i];
                        model.addGiornate(this.createArray(voti[giocatore]));
                    }

                }
                
                if (this.filtri == undefined) {
                    this.addfiltri();
                }

                Backbone.history.loadUrl(Backbone.history.fragment);

                this.loadDisponibili();
            },

            createArray: function(obj) {
                var arr = [];
                for (var i in obj) {
                    obj[i]["giornata"] = i;
                    arr.push(obj[i]);
                }
                return arr;
            },

            addfiltri: function() {
                this.filtri = new FiltriView({ collection: this.collection, app: this });
                this.attach($(this.filtriId), this.filtri);
            },

            filterList: function(ruolo) {
                return this.collection.where({ Ruolo: ruolo });
            },

            filterCollection: function(filters) {
                this.portieri.filterCollection(filters);
                this.difensori.filterCollection(filters);
                this.centrocampisti.filterCollection(filters);
                this.attaccanti.filterCollection(filters);
            },

            loadDisponibili: function(force) {
                force = force || false;
                var loc = this.disponibili,
                    that = this;

                if (loc == undefined || force == true) {
                    $.ajax({
                        url: "inc/disponibili_ufficio.js",//DISPONIBILI FILE
                        success: function(data, textStatus, jqXHR) {
                            that.disponibili = JSON.parse(data);
                            localStorage.setItem('disponibili', JSON.stringify(that.disponibili));
                            that.passDisponibili();
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            alert('Error retrieving information from server.')
                        }
                    });
                } else {
                    var data = localStorage.getItem('disponibili');
                    this.disponibili = JSON.parse(data);
                    this.passDisponibili();
                }
            },

            passDisponibili: function() {
                var data = localStorage.getItem('disponibili'),
                    parsedData = JSON.parse(data),
                    models = this.collection.models;

                for (var i=0, l=models.length; i<l; i++) {
                    var model = models[i],
                        disp = (parsedData.indexOf(model.get('Giocatore')) < 0);

                    model.set('disponibile', disp);
                }

                this.filtri.printDisponibili(data);
            },

            importaDisponibili: function(textarea) {
                var data = textarea.val().toUpperCase();
                this.disponibili = data.replace(/[\[\]\"\\]/g, '').replace(/(?:\,\s)/g,',').replace(/(?:\s\,)/g,',').split(',');
                localStorage.setItem('disponibili', JSON.stringify(this.disponibili));
                this.passDisponibili();
            },

            attach: function(container, view) {
                container.append(view.$el);
            }
        }))({ el: '#listaVoti', collection: new Giocatori(elencoCalciatori) });


    $(document).ready(function() {

        App.render();
        Backbone.history.start();

    });

})(jQuery);