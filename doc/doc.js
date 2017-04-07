/**
 * Created by chris on 07/04/17.
 */

/* pour que l'accordeon se replie */
$( function() {
    $( "#accordion" ).accordion({
        collapsible: true
    });
} );
$(document).ready(function(){
    /* pour que l'accordeon soit replié au départ*/
    $("#accordion").accordion({ active: false });

    /* traitement des boutons "essayer" */
    $('.accord').one('click', function(){
        var id = $(this).attr('id');
        var base = 'http://vps330078.ovh.net/sonde/api';
        var url ="";
        /* construction de l'url en fonction du bouton cliqué */
        switch (id) {
            case "day_l":
                url = base+"/meas/day/last";
                break;
            case "day_c":
                url = base+"/meas/day/current";
                break;
            case "day_p":
                var date = "2017-04-01";
                url = base+"/meas/day/" + date;
                break;
            case "day_i":
                var date1 = "2017-04-01";
                var date2 = "2017-04-02";
                url = base+"/meas/days/" + date1 + "/" + date2;
                break;
            case "mon_c":
                url = base+"/meas/month/current";
                break;
            case "mon_p":
                var mois = "2017-04";
                url = base+"/meas/month/" + mois;
                break;
            case "mon_i":
                var mois1 = "2017-04";
                var mois2 = "2017-05";
                url = base+"/meas/months/" + mois1 + "/" + mois2;
                break;}
        /* appel ajax pour les relevés de la période choisie */
        $.ajax({
            method:"GET",
            url:url,
            dataType: "text"
        }).done(function(data){
            /* pour limiter l'affichage des données reçues */
            if (data.length > 100){
                data = data.slice(0,150);
                data += " ... données tronquées";
            }
            var affich = "<p><strong>Url de la requête :</strong></p><p>"+url;
            affich += "</p><p><strong>Réponse de la requête :</strong></p><p>"+data+"</p>";
            $('#'+id).append(affich);
        }).fail(function(data){
            $('#'+id).append("<p>Pas de réponse reçue du serveur pour l'url : "+url+" !</p>");
        });
    });
});