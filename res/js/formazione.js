(function($) {

    //MODELS AND COLLECTIONS ============================================================
        //GIOCATORE MODEL
        var Giocatore = Backbone.Model.extend({
            defaults: {
                "ID": "",
                "Giocatore": "",
                "Ruolo": "",
                "Squadra": ""
            }
        });

        //SQUADRA
        var Rosa = Backbone.Collection.extend({
            model: Giocatore,

            comparator : function(g) {
                return g.get("Giocatore");
            }
        });

        //FORMAZIONE MODEL
        var Formazione = Backbone.Model.extend({
            defaults: {
                "Nome": "",
                "Portieri": 1,
                "Difensori": 0,
                "Centrocampisti": 0,
                "Attaccanti": 0
            },

            initialize: function() {
                var formazione = this.get('Nome').split('-');
                this.set('Portieri', 1);
                this.set('Difensori', parseInt(formazione[0], 10));
                this.set('Centrocampisti', parseInt(formazione[1], 10));
                this.set('Attaccanti', parseInt(formazione[2], 10));
            }
        });

        //FORMAZIONI
        var Formazioni = Backbone.Collection.extend({
            model: Formazione,

            comparator : function(g) {
                return g.get("Nome");
            }
        });
    //===================================================================================

    //VIEWS =============================================================================
        //VIEW OPZIONI (View of Collection Formazioni)
        var SelectFormazioni = Backbone.View.extend({
            createdViews: {},
            select: undefined,
            currentModel: undefined,

            events: {
                'change select': 'setCurrentModel'
            },

            initialize: function() {
                this.select = this.$('select.formazione');
                this.render();
            },

            render: function() {
                this.updateOptions();
                return this;
            },

            updateOptions: function() {
                this.select.select2("destroy");
                this.select.empty();
                _(this.collection).each(function(g) { 
                    var opt = new SelectOption({ model: g });
                    this.attach(this.select, opt);
                }, this);
                this.select.select2({
                    containerCss: {
                        'width': '75%',
                        'padding': '0 0 10px'
                    }
                });
                this.setCurrentModel();
            },

            setCurrentModel: function() {
                var opt = $(this.select.find('option:selected')).data('view');
                this.currentModel = opt.model;
                this.setLimits();
            },

            setLimits: function() {
                fdfd
            },

            attach: function(container, view) {
                container.append(view.$el);
            }
        });

        //VIEW TAB CONFIGURAZIONE (View of Model Formazione)
        var SelectOption = Backbone.View.extend({
            templateId: '#scegli-formazioni',

            initialize: function() {
                this.template = _.template($(this.templateId).html());
                this.render();
            },

            render: function() {
                var formazione = this.model.get('Nome');
                this.setElement($(this.template({ formazione: formazione })));
                this.$el.data({ 'view': this });
                return this;
            }
        });

        //VIEW TABELLE RUOLI (View of Collection Rosa)
        var TabellaGiocatori = Backbone.View.extend({
            templateId : '#tab-squadra-contenuto-tabella',
            selectId: 'select.elenco',
            select: undefined,
            tableId: 'table.tabella-calciatori tbody',
            table: undefined,
            giocatori: 0,
            currentModel: undefined,
            alertId: '#alert',
            alertContainer: '.alert-container',


            events: {
                'click a.aggiungi-giocatore': 'addGiocatore',
                'change select.elenco': 'setCurrentModel'
            },

            initialize: function() {
                this.ruolo = this.options.ruolo;
                this.squadra = this.options.squadra;
                this.calciatori = this.options.calciatori;
                this.maxGiocatori = this.options.maxGiocatori;
                this.giocatori = this.filterList(this.collection).length;
                this.collection.on("add", this.addToTable, this);
                this.collection.on("remove", this.removeFromTable, this);
                this.template = _.template($(this.templateId).html());
                this.render();
            },

            render: function() {
                this.setElement($(this.template({ ruolo: this.ruolo })));
                this.select = this.$(this.selectId);
                this.table = this.$(this.tableId);
                this.setFields();
                this.setNum(this.giocatori);
                return this;
            },

            setFields: function() {
                this.setSelect();
            },

            setSelect: function() {
                this.select.select2("destroy");
                this.select.empty();
                var list = this.filterList(this.calciatori);
                _(list).each(function(g) { 
                    var opt = new SelectOption({ model: g });
                    this.attach(this.select, opt);
                }, this);
                this.select.select2({
                    containerCss: {
                        'width': '75%',
                        'padding': '0 0 10px'
                    }
                });
                this.setCurrentModel();
            },

            setNum: function() {
                var tgt = this.$('small.num');
                tgt.html(this.giocatori+' di '+this.maxGiocatori);
            },

            setCurrentModel: function() {
                var opt = $(this.select.find('option:selected')).data('view');
                this.currentModel = opt.model;
            },

            addGiocatore: function() {
                this.giocatori = this.filterList(this.collection).length;
                if (this.giocatori < this.maxGiocatori) {
                    this.calciatori.remove(this.currentModel);
                    this.collection.add(this.currentModel);
                } else {
                    this.displayAlert('Hai raggiunto il numero massimo di giocatori per questo ruolo.');
                }
            },

            removeGiocatore: function(model) {
                this.calciatori.add(model);
                this.collection.remove(model);
            },

            displayAlert: function(msg) {
                this.alert = _.template($(this.alertId).html(), { message: msg });
                this.$(this.alertContainer).html(this.alert);
                this.$(this.alertContainer).find('.alert').fadeOut(6000);
            },

            emptyAlert: function() {
                this.$(this.alertContainer).empty();
                this.$(this.alertContainer).show();
            },

            resetTables: function() {
                this.setFields();
                this.setNum();
            },

            addToTable: function(model) {
                this.giocatori = this.filterList(this.collection).length;
                var tr = new PlayerTableRow({ model: model });
                if (model.get('Ruolo') == this.ruolo) {
                    this.attach(this.table, tr);
                    this.resetTables();
                }
            },

            removeFromTable: function(model) {
                this.removeGiocatore(model);
                this.giocatori = this.filterList(this.collection).length;
                this.resetTables();
            },

            attach: function(container, view) {
                container.append(view.$el);
            },

            filterList: function(collection) {
                return collection.where({ Ruolo: this.ruolo });
            }
        });

        //VIEW TABLE PLAYER (View of Model Giocatore - used by Rosa and App.calciatori)
        var PlayerTableRow = Backbone.View.extend({
            templateId: '#rosa-riga-calciatore',

            events: {
                'click a.rimuovi-giocatore': 'rimuoviGiocatore'
            },

            initialize: function() {
                this.template = _.template($(this.templateId).html());
                this.render();
            },

            render: function() {
                var id = this.model.get('ID'),
                    name = this.model.get('Giocatore'),
                    team = this.model.get('Squadra');
                this.setElement($(this.template({ id: id, name: name, team: team })));
                return this;
            },

            rimuoviGiocatore: function() {
                this.model.collection.remove(this.model);
                this.$el.remove();
            }
        });
    //===================================================================================

    //MAIN APP===========================================================================
        //MAIN VIEW CONTROLLER
        var App = new (Backbone.View.extend({
            opzioniId: '#opzioni',
            opzioni: undefined,

            events: {
                
            },

            initialize: function() {
                
            },

            render: function() {
                this.setupOpzioni();
            },

            setupOpzioni: function() {
                var collection = [];
                
                for (var i=0, l=config.formazione.formazioni.length; i<l; i++) {
                    var formazione = config.formazione.formazioni[i],
                        model = new Formazione({ "Nome": formazione });

                    collection.push(model);
                }

                this.opzioni = new SelectFormazioni({ el: this.$(this.opzioniId), collection: collection });
            }
        }))({ el: '#configuraFormazione', collection: rosa });

    $(document).ready(function() {

		// //SETUP INITIAL FORMATION
  //       formazioni = config.formazione.formazioni;
  //       panca = {
  //           'portieri' : config.panchina.portieri,
  //           'difensori' : config.panchina.difensori,
  //           'centrocampisti' : config.panchina.centrocampisti,
  //           'attaccanti' : config.panchina.attaccanti
  //       };

  //       //FILL SELECT FORMAZIONI
  //       initFormazioni();

  //       //COMPONI ROSA
  //       initRosa();

        App.render();

    });

    // //INIT SELECT FORMAZIONI
    // function initFormazioni() {

    //     for (var i=0, l=formazioni.length; i<l; i++) {
    //         var data = {'formazione': formazioni[i]},
    //             tpl = _.template($( "#scegli-formazioni" ).html(), data);
    //         $('#formazioni').append(tpl);
    //     }

    //     $('#formazioni').change(function(e) {
    //         setupLabels($(this).val());
    //     });

    //     setupLabels($('#formazioni').val());

    // }

    // //SETUP LABELS CAMPO
    // function setupLabels(formazione) {

    //     formazione = formazione.split('-');
    //     campo = {
    //         'portieri': 1,
    //         'difensori': formazione[0],
    //         'centrocampisti': formazione[1],
    //         'attaccanti': formazione[2]
    //     }


    //     $('h4.portieri small.num').empty().append(schieratiCampo.portieri+' di '+campo.portieri);
    //     $('h4.difensori small.num').empty().append(schieratiCampo.difensori+' di '+campo.difensori);
    //     $('h4.centrocampisti small.num').empty().append(schieratiCampo.centrocampisti+' di '+campo.centrocampisti);
    //     $('h4.attaccanti small.num').empty().append(schieratiCampo.attaccanti+' di '+campo.attaccanti);

    // }

    // //INIT ROSA SQUADRA 
    // function initRosa() {

    //     for (var i=0, l=rosa.length; i<l; i++) {
    //         var data = rosa[i],
    //             tpl = _.template($( "#rosa-riga-calciatore" ).html(), data);

    //         if (data['Ruolo'] == 'P') {
    //             $('.rosa-giocatori .tabella-portieri tbody').append(tpl);
    //         } else if (data['Ruolo'] == 'D') {
    //             $('.rosa-giocatori .tabella-difensori tbody').append(tpl);
    //         } else if (data['Ruolo'] == 'C') {
    //             $('.rosa-giocatori .tabella-centrocampisti tbody').append(tpl);
    //         } else if (data['Ruolo'] == 'A') {
    //             $('.rosa-giocatori .tabella-attaccanti tbody').append(tpl);
    //         }
    //     }

    //     $('.rosa-giocatori table').delegate('tr.riga-calciatore a.inserisci-giocatore-formazione', 'click', function() {
    //         var row = $($(this).parents('tr')),
    //             table = $($('table'+$(this).attr('rel')).find('tbody')),
    //             text = $($('h4'+$(this).attr('rel')).find('small.num')),
    //             schieramento = $(this).attr('rel').split('-')[1],
    //             player = { 'ID': $(row.find('td')[0]).html(), 'Giocatore': $(row.find('td')[1]).html(), 'Squadra': $(row.find('td')[2]).html() };

    //         aggiungiGiocatore(player, text, table, schieramento);

    //         return false;
    //     });

    // }

    // function aggiungiGiocatore(player, text, table, schieramento) {
    //     var id = player['ID'],
    //         name = player['Giocatore'],
    //         team = player['Squadra'],
    //         duped = false,
    //         overLimit = false,
    //         alertContainer = $($(table.parents('table')).siblings('.alert-container'));

    //     $(table.find('tr.riga-calciatore td:first')).each(function(i, e) {
    //         if ($(e).html() == id) {
    //             duped = true;
    //         }
    //     });

    //     if (table.find('tr').length >= rosa[text.attr('data-num')]) overLimit = true;

    //     //CAN ADD PLAYER
    //     if (duped == false && overLimit == false) {
    //         var data = {'player': player, 'name': name, 'team': team, 'id': id},
    //             tpl = _.template($( "#rosa-riga-calciatore" ).html(), data);

    //         table.append(tpl)

    //         aggiornaLimiti(text, table, schieramento);

    //         //EMPTY ALERT
    //         gestisciAlert(alertContainer);
    //     } 

    //     //CANNOT ADD PLAYER, SHOW ALERTS
    //     else if (duped == true && overLimit == false) {
    //         var msg = '<strong>Attenzione!</strong><br />Il giocatore fa già parte di <strong>"'+dupedTeam+'"</strong>.';
    //         //EMPTY ALERT & FILL
    //         gestisciAlert(alertContainer, 'alert', msg);
    //     } else if (duped == false && overLimit == true) {
    //         var msg = '<strong>Attenzione!</strong><br />Hai gi&agrave; raggiunto il numero di giocatori consentiti per questa posizione.';
    //         //EMPTY ALERT & FILL
    //         gestisciAlert(alertContainer, 'alert', msg);
    //     } else if (duped == true && overLimit == true) {
    //         var msg = '<strong>Attenzione!</strong><br />Il giocatore fa già parte di <strong>"'+dupedTeam+'"</strong>.';
    //         //EMPTY ALERT & FILL
    //         gestisciAlert(alertContainer, 'alert', msg);
    //     }
    // }

    // function aggiornaLimiti(elem, table, schieramento) {
    //     var data = $(elem).attr('data-num'),
    //         num = 0,
    //         total = table.find('tr').length;

    //     if (schieramento =='campo') {
    //         num = campo[data];
    //         schieratiCampo[data] = num;
    //     } else {
    //         num = panca[data];
    //         schieratiPanca[data] = num;
    //     }

    //     $(elem).empty().append(total+' di '+num);

    //     if (total == num) {
    //         $(elem).addClass('label-success');
    //         table.find('tr').addClass('success');
    //     } else {
    //         $(elem).removeClass('label-success');
    //         table.find('tr').removeClass('success');
    //     }
    // }

    // function gestisciAlert (target, action, message) {
    //     action = action || '';
    //     message = message || '';

    //     var data = { 'message': message },
    //         tpl = _.template($( "#alert" ).html(), data);

    //     target.empty();

    //     if (action == 'alert') {
    //         target.append(tpl);
    //     } else if (action == 'success') {
    //         $(target.append(tpl).find('.alert')).addClass('alert-success');
    //     }
    // }

})(jQuery);