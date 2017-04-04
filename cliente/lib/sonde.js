/**
 * Created by chris on 04/04/17.
 */
$(document).ready(function(){
    $.ajax({
        method:"GET",
        url:"http://localhost/sonde/api/meas/day/last",
        dataType: "json"
    }).done(function(data){
        $('.affich').append("<p>Dernière Température reçue :</p>");
        var affich = "<p>Date : "+data['date']+"</p><p>Température : </p><p class='lcd'>"+data['temp']+" °C</p>"
        affich += "<p>Humidité : </p><p class='lcd'>"+data['humid']+" %</p>";
        $('.affich').append(affich);
    });
    //$("#reglages").click(function(event){
    //    event.preventDefault();
    //    linkLocation = this.href;
    //    $(".reglages").css('display', 'block');
    //    $(".accueil").css('display', 'none');
    //});

    $('#mon_menu a').click(function() {
        var navbar_toggle = $('.navbar-toggle');
        if (navbar_toggle.is(':visible')) {
            navbar_toggle.trigger('click');
        }
        //var list = $('li').parent(this);
        //$(list).attr('class', 'active');
        //alert ($(this).attr('id'));
    });

    $("#envoi").click(function(){
        var choix = $('input[type=radio][name=choix]:checked').attr('value');
        var url ="";
        switch (choix) {
            case "date_co":
                url = "http://localhost/sonde/api/meas/day/current";
                break;
            case "date_pa":
                var date = $('#val_dat_pa').val();
                url = "http://localhost/sonde/api/meas/day/" + date;
                break;
            case "date_in":
                var date1 = $('#val_dat_in1').val();
                var date2 = $('#val_dat_in2').val();
                url = "http://localhost/sonde/api/meas/days/" + date1 + "/" + date2;
                break;
            case "mois_co":
                url = "http://localhost/sonde/api/meas/month/current";
                break;
            case "mois_pa":
                var date = $('#val_moi_pa').val();
                url = "http://localhost/sonde/api/meas/month/" + date;
                break;
            case "mois_in":
                var date1 = $('#val_moi_in1').val();
                var date2 = $('#val_moi_in2').val();
                url = "http://localhost/sonde/api/meas/months/" + date + "/" + date2;
                break;
        }
        var donnees = "<table class='table table-bordered table-striped table-condensed'>"
        donnees += "<thead><tr><td>Date</td><td>Temp</td><td>Humid</td></tr></thead><tbody>";
        var stat = "";
        var temp = [];
        var humd = [];
        var date = [];
        $.ajax({
            method:"GET",
            url: url,
            dataType: "json"
        }).done(function(data){
            for (var meas in data){
                temp.push(parseInt(data[meas]['temp']));
                humd.push(parseInt(data[meas]['humid']));
                date.push(data[meas]['date']);
                donnees += "<tr><td>"+data[meas]['date']+"</td><td>"+data[meas]['temp']+" °C</td><td>"+data[meas]['humid']+" %</td></tr>";
            }
            donnees += "</tbody></table>";
            stat += "<p>Température mini : "+Math.min(...temp)+"<br>";
            stat += "Température max : "+Math.max(...temp)+"<br>";
            var moyen = 0;
            for (var i in temp) moyen += temp[i];
            stat += "Température moyenne : "+(moyen/temp.length).toFixed(2)+"<br></p>";
            stat += "<p>Humidité mini : "+Math.min(...humd)+"<br>";
            stat += "Humidité max : "+Math.max(...humd)+"<br>";
            var moyen = 0;
            for (var i in humd) moyen += humd[i];
            stat += "Humidité moyenne : "+(moyen/humd.length).toFixed(2)+"<br></p>";
            $('.donnees').html(stat);
            $('.donnees').append(donnees);

            var chaine = "";
            for ( var i=0; i<temp.length; i++){
                var newdate = date[i].replace(/-/g,"/");
                chaine += newdate+","+temp[i]+","+humd[i]+"\n";
            }
            new Dygraph(dygraph, 								// le retour à la ligne fait comprendre que le paramètre n'est pas un fichier
                chaine,
                {
                    title: 'Température et Humidité',				// diverses options
                    labels : [ "Date", "Température", "Humidité" ],
                    labelsDivStyles: { 'textAlign': 'right' },
                    labelsDivWidth: 150,
                    labelsSeparateLines: true,
                    valueRange: [15, 50],
                    legend: 'always',
                    ylabel: 'Température (°C) - Humidité (%)',
                    showRoller: false,
                    showRangeSelector: true,
                    height: 400
                });
        });
    });
});