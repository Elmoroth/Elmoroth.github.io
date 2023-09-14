
function readFamilies(json) {
    displayMenu(json);

    values = json.values;
    values.reduce(makeTree, '');
}

function displayMenu(json) {
    let ls_html = '';
    let ls_last_order = '';
    json.values.forEach(function (item, index) {
        if(index!=0){
            if( item[index,6] == 'TRUE' ){
                if( ls_html != '' ){
                    ls_html += '</dl>'
                }
                ls_html += '<dl class="mblock">';
                if(item[index,2] == 'Order' || item[index,2] == 'Superorder'){
                    ls_html += '<dd class="morder">'+item[index,1].toUpperCase()+'</dd>';
                } else {
                    ls_html += '<dd class="morder">'+ls_last_order+' - '+item[index,1].toUpperCase()+'</dd>';
                }
            }
            if( item[index,2] == 'Family' && item[index,5] != 'TRUE' ){
                ls_html += '<dt class="mfamily"><div class="smallimage"><img src="https://cdn.download.ams.birds.cornell.edu/api/v1/asset/'+item[index,8]+'/160" loading="lazy"/></div><a href="#'+item[index,1]+'" class="mlink"><span class="mlatin">'+item[index,1]+'</span><span class="menglish">'+item[index,3]+'</span></a></dt>';
            }
            if( item[index,2] == 'Order' ){
                ls_last_order = item[index,1].toUpperCase();
            }
        }
    });
    ls_html += '</dl>'
    $( '.mlist' ).append( ls_html );
}

function displayContent(json) {
    values = json.values;
    loadFamily();
}
            
function loadFamily(){
    var data='';
    var species=0;
    values.forEach(function(item, index, arr) {
        switch(item[0]){
            case 'Taxon': 
                data += '<div class="superorder heading"><span class="famlatin">'+item[1]+'</span>'
                var cnt = 0;
                var arrayLength = arr.length;
                for (var i = index; i < arrayLength; i++) {
                    var it = arr[i];
                    if( it[1] !== item[1] ){
                        break;
                    }
                    if( it[0] == 'species' ){
                        cnt ++;
                    }
                }
                if(cnt > 0 ){
                    data += '<span class="famcount">'+cnt+' sp.</span>'
                }
                data += '</div>';
                break;
            case 'Order': 
                data += '<div class="order heading"><span class="famlatin">'+item[2]+'</span>'
                var cnt = 0;
                var arrayLength = arr.length;
                for (var i = index; i < arrayLength; i++) {
                    var it = arr[i];
                    if( it[2] !== item[2] ){
                        break;
                    }
                    if( it[0] == 'species' ){
                        cnt ++;
                    }
                }
                if(cnt > 0 ){
                    data += '<span class="famcount">'+cnt+' sp.</span>'
                }
                data += '</div>';
                break;
            case 'Suborder': 
                data += '<div class="suborder heading"><span class="famlatin">'+item[3]+'</span>'
                var cnt = 0;
                var arrayLength = arr.length;
                for (var i = index; i < arrayLength; i++) {
                    var it = arr[i];
                    if( it[3] !== item[3] ){
                        break;
                    }
                    if( it[0] == 'species' ){
                        cnt ++;
                    }
                }
                if(cnt > 0 ){
                    data += '<span class="famcount">'+cnt+' sp.</span>'
                }
                data += '</div>';
                break;
            case 'Infraorder': 
                data += '<div class="infraorder heading"><span class="famlatin">'+item[4]+'</span>'
                var cnt = 0;
                var arrayLength = arr.length;
                for (var i = index; i < arrayLength; i++) {
                    var it = arr[i];
                    if( it[4] !== item[4] ){
                        break;
                    }
                    if( it[0] == 'species' ){
                        cnt ++;
                    }
                }
                if(cnt > 0 ){
                    data += '<span class="famcount">'+cnt+' sp.</span>'
                }
                data += '</div>';
                break;
            case 'Parvorder': 
                data += '<div class="parvorder heading"><span class="famlatin">'+item[5]+'</span>'
                var cnt = 0;
                var arrayLength = arr.length;
                for (var i = index; i < arrayLength; i++) {
                    var it = arr[i];
                    if( it[5] !== item[5] ){
                        break;
                    }
                    if( it[0] == 'species' ){
                        cnt ++;
                    }
                }
                if(cnt > 0 ){
                    data += '<span class="famcount">'+cnt+' sp.</span>'
                }
                data += '</div>';
                break;
            case 'Superfamily': 
                data += '<div class="superfamily heading"><span class="famlatin">'+item[6]+'</span>'
                var cnt = 0;
                var arrayLength = arr.length;
                for (var i = index; i < arrayLength; i++) {
                    var it = arr[i];
                    if( it[6] !== item[6] ){
                        break;
                    }
                    if( it[0] == 'species' ){
                        cnt ++;
                    }
                }
                if(cnt > 0 ){
                    data += '<span class="famcount">'+cnt+' sp.</span>'
                }
                data += '</div>';
                break;
            case 'Family': 
                data += '<div id="'+item[7]+'" class="family heading"><span class="famlatin">'+item[7]+'</span>'
                if(item[19]){
                    data += '<span class="famenglish">'+item[19]+'</span>'
                }
                var cnt = 0;
                var arrayLength = arr.length;
                for (var i = index; i < arrayLength; i++) {
                    var it = arr[i];
                    if( it[7] !== item[7] ){
                        break;
                    }
                    if( it[0] == 'species' ){
                        cnt ++;
                    }
                }
                if(cnt > 0 ){
                    data += '<span class="famcount">'+cnt+' sp.</span>'
                }
                data += '</div>';
                if(arr[index + 1]){
                    if(arr[index + 1][0] === 'genus'){
                        data += '<ol class="genuslist">';
                    }
                }
                break;
            case 'Subfamily': 
                data += '<div class="subfamily heading"><span class="famlatin">'+item[8]+'</span>'
                if(item[19]){
                    data += '<span class="famenglish">'+item[19]+'</span>'
                }
                var cnt = 0;
                var arrayLength = arr.length;
                for (var i = index; i < arrayLength; i++) {
                    var it = arr[i];
                    if( it[8] !== item[8] ){
                        break;
                    }
                    if( it[0] == 'species' ){
                        cnt ++;
                    }
                }
                if(cnt > 0 ){
                    data += '<span class="famcount">'+cnt+' sp.</span>'
                }
                data += '</div>';
                if(arr[index + 1]){
                    if(arr[index + 1][0] === 'genus'){
                        data += '<ol class="genuslist">';
                    }
                }
                break;
            case 'Tribe': 
                data += '<div class="tribe heading"><span class="famlatin">'+item[9]+'</span>'
                if(item[19]){
                    data += '<span class="famenglish">'+item[19]+'</span>'
                }
                var cnt = 0;
                var arrayLength = arr.length;
                for (var i = index; i < arrayLength; i++) {
                    var it = arr[i];
                    if( it[9] !== item[9] ){
                        break;
                    }
                    if( it[0] == 'species' ){
                        cnt ++;
                    }
                }
                if(cnt > 0 ){
                    data += '<span class="famcount">'+cnt+' sp.</span>'
                }
                data += '</div>';
                if(arr[index + 1]){
                    if(arr[index + 1][0] === 'genus'){
                        data += '<ol class="genuslist">';
                    }
                }
                break;
            case 'genus': 
                data += '<li class="genusblock">';
                data += '<div class="genusheader">';
                data += '<span class="genus">'+item[15]+'</span>';
                var cnt = 0;
                var arrayLength = arr.length;
                for (var i = index + 1; i < arrayLength; i++) {
                    var it = arr[i];
                    if( it[0] == 'genus' ){
                        break;
                    }
                    if( it[0] == 'species' ){
                        cnt ++;
                    }
                }
                if(cnt > 0 ){
                    data += '<span class="famcount">'+cnt+' sp.</span>'
                }
                data += '</div>'; //genusheader
                data += '<ol class="specieslist">';
                break;
            case 'species': 
                data += '<li class="species">';
                data+= '<div class="speciesheader">'
                data+= '<div class="rangeblock">'
                let range = item[25];
                data+= '<span class="range">'+range.slice(0,range.indexOf(':'))+'</span>';
                data+= '<span class="rangetooltip">'+range.slice(range.indexOf(':')+1)+'</span>';
                data+= '</div>'; //rangeblock
                if(item[21]){
                    data+= '<div class="iucnblock iucn-'+item[21].substring(0,2)+'">';
                    data+= '<span class="iucn">'+item[21].substring(0,2)+'</span>';
                    data+= '</div>'; //iucnblock
                }
                data+= '</div>'; //speciesheader
                data+= '<div class="pictures">'
                data += '<a href="https://birdsoftheworld.org/bow/species/'+item[29]+'" target="_blank" class="imageblock">';
                data += '<img ';
                if(item[21] == 'EX' || item[21] == 'CR (PE)' || item[21] == 'FO'){
                    data += 'style="opacity: 0.5" '
                }
                if(item[28] !== '#N/A' && item[28] !== '' && item[28] !== undefined){
                    data += 'src="https://cdn.download.ams.birds.cornell.edu/api/v1/asset/'+item[28]+'/160" loading="lazy"/>'
                } else if(item[27] !== '' && item[27] !== undefined) {
                    data += 'src="Pics/'+item[27]+'" loading="lazy"/>'
                } else {
                    data += 'src="data:image/png;base64,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" alt="Currently unavailable">'
                }
                data+= '</a>';
                
                var arrayLength = arr.length;
                ssploop: for (var i = index + 1; i < arrayLength; i++) {
                    var it = arr[i];
                    switch(it[0]){
                        case 'group (monotypic)': 
                        case 'group (polytypic)': 
                            if(it[28] !== '#N/A' && it[28] !== '' && it[28] !== undefined){
                                data += '<a href="https://birdsoftheworld.org/bow/species/'+it[29]+'" target="_blank" class="imageblock">';
                                data += '<img ';
                                if(it[21] == 'EX' || it[21] == 'CR (PE)' || it[21] == 'FO'){
                                    data += 'style="opacity: 0.5" '
                                }
                                data += 'src="https://cdn.download.ams.birds.cornell.edu/api/v1/asset/'+it[28]+'/160" loading="lazy"/>'
                                data += '</a>';
                            }
                            break;
                        case 'ssp': 
                            break;
                        default:
                            break ssploop;
                    }
                }
                
                data+= '</div>'; //pictures
                data+= '<div class="caption">'
                data+= '<span class="english">'+item[19]+'</span>';
                data+= '<span class="latin">'+item[15]+' '+item[17]+'</span>';
                if(item[24]){
                    var ls_info = item[24];
                    ls_info = ls_info.replaceAll(/(?<!\S\s)(?<!\S\s\S\s)(\S\S+)\. /g, '$1.\n');
                    
                    data+= '<div class="infoblock">';
                    data+= '<span class="info">i</span>';
                    data+= '<span class="tooltip">'+ls_info+'</span>';
                    data+= '</div>'; //infoblock
                }
                data+= '</div>'; //caption
                data+= '</li>'; //species
                if(arr[index + 1]){
                    switch(arr[index + 1][0]){
                        case 'species': 
                        case 'ssp': 
                        case 'group (monotypic)': 
                        case 'group (polytypic)': 
                            break;
                        default:
                            data += '</ol></li>';
                            if(arr[index + 1][0] !== 'genus'){
                                data += '</ol>';
                            }
                    }
                }
                if(item[21] !== 'EX' && item[21] !== 'CR (PE)' && item[21] !== 'FO'){
                    species ++;
                }
                break;
            case 'ssp': 
            case 'group (monotypic)': 
            case 'group (polytypic)': 
                if(arr[index + 1]){
                    switch(arr[index + 1][0]){
                        case 'species': 
                        case 'ssp': 
                        case 'group (monotypic)': 
                        case 'group (polytypic)': 
                            break;
                        default:
                            data += '</ol></li>';
                            if(arr[index + 1][0] !== 'genus'){
                                data += '</ol>';
                            }
                    }
                }
        }
    });
    document.getElementById("list").innerHTML = data;
    document.getElementById("cnt_top").innerHTML = species+' sp.';
}

function toggleMenu(){
    var el = document.getElementById("familymenu");
    el.classList.toggle("hidden");
    el.classList.toggle("famvis");
}
function toggleTree(){
    $( '#list' ).toggle();
    $( '#tree' ).toggle();
    $( '#treemenu' ).toggle();
    $( '#listmenu' ).toggle();
}
function jump(e){
    
    toggleMenu()
}


function makeTree(ls_html, item, index, arr){
    if( index == 0 ){return ''};
    let parentclass = item[index,0] ? item[index,0] : '';
    let latin = item[index,1] ? item[index,1] : '';
    let classname = item[index,2] ? item[index,2] : 'subclass';
    let english = item[index,3] ? item[index,3] : '';
    let ls_next = '';
    let la_nextitem = arr[index + 1];
    if( la_nextitem ){
        ls_next = la_nextitem[0] ;
    }
    
    let latinid = latin;
    if( item[index,5] == 'TRUE' ){
        latin = '† '+latin;
    }
    
    var li;
    if( ls_next	== latinid ){
        li = $("<li/>")
            .append(
                $("<div/>")
                .addClass(classname.toLowerCase())
                .addClass("mfamily")
                .addClass("lightgrey")
                .append(
                    $("<span/>")
                    .addClass(item[index,8] ? "smallimage_list": "")
                    .append(
                        item[index,8] ? $("<img/>").attr("src", "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/"+item[index,8]+"/160").attr("loading", "lazy") : ""
                    )
                )
                .append(
                    $("<span/>").addClass("famlatin").text(latin)
                )
                .append(
                    $("<span/>").addClass("famenglish").text(english)
                )
            )
            .append(
                $("<ul/>", {"id":latinid})
            )
                    ;
    } else {
        li = $("<li/>")
            .append(
                $("<div/>")
                .attr("id", latinid)
                .addClass(classname.toLowerCase())
                .addClass("mfamily")
                .addClass("lightgrey")
                .append(
                    $("<span/>")
                    .addClass(item[index,8] ? "smallimage_list": "")
                    .append(
                        item[index,8] ? $("<img/>").attr("src", "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/"+item[index,8]+"/160").attr("loading", "lazy") : ""
                    )
                )
                .append(
                    $("<span/>")
                    .addClass("famlatin").text(latin)
                )
                .append(
                    $("<span/>")
                    .addClass("famenglish").text(english)
                )
            )
            .append(
                $("<ol/>")
                    .addClass("birdcontainer")
            );
    }
    $('#'+parentclass).append(li);
    return ls_html;
};