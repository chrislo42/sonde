/**
 * Created by chris on 04/04/17.
 */
$(document).ready(function(){
    var base = "http://localhost/sonde/api";

    /* appel ajax pour le dernier relevé */
    $.ajax({
        method:"GET",
        url:base+"/meas/day/last",
        dataType: "json"
    }).done(function(data){
        var affich = "<p>Dernière Température reçue :</p>";
        affich += "<p>Date : "+data['date']+"</p><p>Température : </p><p class='lcd'>"+data['temp']+" °C</p>"
        affich += "<p>Humidité : </p><p class='lcd'>"+data['humid']+" %</p>";
        $('.affich').html(affich);
    }).fail(function(data){
        $('.affich').html("<p>Pas de réponse reçue du serveur pour l'url : "+base+"/meas/day/last !</p>");
    });

    /* pour replier le menu déroulé après un click */
    $('#mon_menu a').click(function() {
        var navbar_toggle = $('.navbar-toggle');
        if (navbar_toggle.is(':visible')) {
            navbar_toggle.trigger('click');
        }
    });

    /* fonction de traitement du formulaire*/
    $("#envoi").click(function(){
        $('.donnees').empty();
        $('#dygraph').empty();
        var url ="";
        var choix = $('input[type=radio][name=choix]:checked').attr('value');
        /* construction de l'url en fonction du bouton radio sélectionné */
        switch (choix) {
            case "date_co":
                url = base+"/meas/day/current";
                break;
            case "date_pa":
                var date = $('#val_dat_pa').val();
                url = base+"/meas/day/" + date;
                break;
            case "date_in":
                var date1 = $('#val_dat_in1').val();
                var date2 = $('#val_dat_in2').val();
                url = base+"/meas/days/" + date1 + "/" + date2;
                break;
            case "mois_co":
                url = base+"/meas/month/current";
                break;
            case "mois_pa":
                var date = $('#val_moi_pa').val();
                url = base+"/meas/month/" + date;
                break;
            case "mois_in":
                var date1 = $('#val_moi_in1').val();
                var date2 = $('#val_moi_in2').val();
                url = base+"/meas/months/" + date + "/" + date2;
                break;
        }
        var donnees = "<table class='table table-bordered table-striped table-condensed'>"
        donnees += "<thead><tr><td>Date</td><td>Temp</td><td>Humid</td></tr></thead><tbody>";
        var stat = "";
        var temp = [];
        var humd = [];
        var date = [];
        /* appel ajax pour les relevés de la période choisie */
        $.ajax({
            method:"GET",
            url: url,
            dataType: "json"
        }).done(function(data){
            /* si l'appel retourne des données */
            if (data.length != 0) {
                for (var meas in data) {
                    /* remplissage des tableaux pour le graphique*/
                    temp.push(parseInt(data[meas]['temp']));
                    humd.push(parseInt(data[meas]['humid']));
                    date.push(data[meas]['date']);
                    /* construction du tableau d'affichage */
                    donnees += "<tr><td>" + data[meas]['date'] + "</td><td>" + data[meas]['temp'] + " °C</td><td>" + data[meas]['humid'] + " %</td></tr>";
                }
                donnees += "</tbody></table>";
                /* calcul et préparation affichage des extras */
                stat += "<p>Température mini : " + Math.min(...temp) + "<br>";
                stat += "Température max : " + Math.max(...temp) + "<br>";
                var moyen = 0;
                for (var i in temp) moyen += temp[i];
                stat += "Température moyenne : " + (moyen / temp.length).toFixed(2) + "<br></p>";
                stat += "<p>Humidité mini : " + Math.min(...humd) + "<br>";
                stat += "Humidité max : " + Math.max(...humd) + "<br>";
                var moyen = 0;
                for (var i in humd) moyen += humd[i];
                stat += "Humidité moyenne : " + (moyen / humd.length).toFixed(2) + "<br></p>";
                $('.donnees').html(stat);
                $('.donnees').append(donnees);

                /* construction des données à passer au graphique */
                var chaine = "";
                for (var i = 0; i < temp.length; i++) {
                    var newdate = date[i].replace(/-/g, "/");
                    chaine += newdate + "," + temp[i] + "," + humd[i] + "\n";
                }
                /* construction du graphique */
                new Dygraph(dygraph, 								// le retour à la ligne fait comprendre que le paramètre n'est pas un fichier
                    chaine,
                    {
                        title: 'Température et Humidité',				// diverses options
                        labels: ["Date", "Température", "Humidité"],
                        labelsDivStyles: {'textAlign': 'right'},
                        labelsDivWidth: 150,
                        labelsSeparateLines: true,
                        valueRange: [15, 50],
                        legend: 'always',
                        ylabel: 'Température (°C) - Humidité (%)',
                        showRoller: false,
                        showRangeSelector: true,
                        height: 400
                    });
            } else {
                $('.donnees').html("<p>Pas de données à afficher !</p>");
            }
        }).fail(function(data){
            $('.donnees').html("<p>Pas de réponse reçue du serveur pour l'url : "+url+" !</p>");
        });
    });
});