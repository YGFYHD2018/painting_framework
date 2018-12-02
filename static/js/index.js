var g_drawing_buffer = [];
var g_selected_pallet;
var g_led_req_params; // Array [16][32]
var g_led_history_list; //Array [][16][32]
var g_last_update = Date.now();
var g_saved_stamp_params;
var g_is_bold_pen_thickness = false;
const g_icon_path = "static/assets/icon/";
const g_color_path = g_icon_path + "color/Draw_to_Like_icon_";
const g_set_path = g_icon_path + "set/icon_";
const g_effects_path = g_icon_path + "effects/icon_";
const g_tools_path = g_icon_path + "tools/Draw_to_Like_icon_"
const g_pen_path = g_icon_path + "pen/Draw_to_like_pen_"
const g_localhost = "http://painting.local:5001/"
//const g_localhost = "http://192.168.0.100:5001/"
const PALLETS = {
    pallet0: { id:"red", color: "red", led: "FF0000" },
    pallet1: { id:"orange", color: "orange", led: "FF4400" },
    pallet2: { id:"yellow", color: "yellow", led: "FF8800" },
    pallet3: { id:"green", color: "green", led: "00FF00" },
    pallet4: { id:"blue", color: "blue", led: "0000FF" },
    pallet5: { id:"pink", color: "pink", led: "FF0088" },
    pallet6: { id:"lightgreen", color: "lightgreen", led: "FFFF00" },
    pallet7: { id:"aqua", color: "aqua", led: "00FFFF" },
    pallet8: { id:"white", color: "white", led: "FFFFFF" },
    pallet9: { id:"violet", color: "violet", led: "FF00FF" },
    pallet10: { id:"eraser", color: "#88888855", led: "000000" },
    pallet11: { id:"trash", color: "#88888855", led: "000000" },
};
var EFFECTS = {
    effect0:{frag:false,off: g_effects_path+"perapera_Off.png",on: g_effects_path+"perapera_On.png",press:g_effects_path+"perapera_Press.png",filter: "filter-wave"},
    effect1:{frag:false,off: g_effects_path+"jump_Off.png",on: g_effects_path+"jump_On.png",press:g_effects_path+"jump_Press.png",filter:"filter-jump"},
    effect2:{frag:false,off: g_effects_path+"explosion_Off.png",on: g_effects_path+"explosion_On.png",press:g_effects_path+"explosion_Press.png",filter:"filter-explosion"},
    effect3:{frag:false,off: g_effects_path+"exile_Off.png",on: g_effects_path+"exile_On.png",press:g_effects_path+"exile_Press.png",filter:"filter-exile"},
    effect4:{frag:false,off: g_effects_path+"rain_Off.png",on: g_effects_path+"rain_On.png",press:g_effects_path+"rain_Press.png",filter:"filter-bk-rains"},
};
var STAMPS = {
    stamp0:{ off: g_set_path+"clownfish_Off.png",press: g_set_path+"clownfish_Press.png", url:"static/stamps/clownfish.json" },
    stamp1:{ off: g_set_path+"rocket_Off.png",press: g_set_path+"rocket_Press.png", url:"static/stamps/rocket.json" },
    stamp2:{ off: g_set_path+"chicken_Off.png",press: g_set_path+"chicken_Press.png", url:"static/stamps/chicken.json" },
    stamp3:{ off: g_set_path+"note_Off.png",press: g_set_path+"note_Press.png", url:"static/stamps/note.json" },
    stamp4:{ off: g_set_path+"dragonfly_Off.png",press: g_set_path+"dragonfly_Press.png", url:"static/stamps/dragonfly.json" },
    stamp5:{ off: g_set_path+"ladybug_Off.png",press: g_set_path+"ladybug_Press.png", url:"static/stamps/ladybug.json" },
    stamp6:{ off: g_set_path+"heart_Off.png",press: g_set_path+"heart_Press.png", url:"static/stamps/heart.json" },
    stamp7:{ off: g_set_path+"chinanago_Off.png",press: g_set_path+"chinanago_Press.png", url:"static/stamps/chinanago.json" },
    stamp8:{ off: g_set_path+"flamingo_Off.png",press: g_set_path+"flamingo_Press.png", url:"static/stamps/flamingo.json" },
    stamp9:{ off: g_set_path+"penguin_Off.png",press: g_set_path+"penguin_Press.png", url:"static/stamps/penguin.json" },
}
var TOOLS = {
    undo:{off: g_tools_path+"undo_Off.png", press: g_tools_path+"undo_Press.png",method:undo()},
    redo:{off: g_tools_path+"redo_Off.png", press: g_tools_path+"redo_Press.png",method:redo()},
    trash:{off: g_tools_path+"trash_Off.png", press: g_tools_path+"trash_Press.png",method:trash()},
    eraser:{off: g_tools_path+"eraser_Off.png", press: g_tools_path+"eraser_Press.png",method:eraser()},
}
const CELL_WIDTH = 18;
const CELL_HEIGHT = 18;

const is_mobile_dvice = () => {
    return  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const get_touch_event_key = () => {
    return is_mobile_dvice() ? "touchstart" : "click";
}
const updatePallet = () =>{

    for(let id in PALLETS){
        const type = id === g_selected_pallet? "On" : "Off";
        const color_path = g_color_path + PALLETS[id]['id'] + '_' + type + '.png';
        $("#" + id).children('img').attr("src", color_path);
        if(type === "On"){
            const pen_type = g_is_bold_pen_thickness? "_L" : "";
            const pen_opposite_type = g_is_bold_pen_thickness? "" : "_L";
            var pen_path = g_pen_path + PALLETS[id]['id'] +'.png';
            var pen_opposite_path = ''

            if(PALLETS[id]['id'] === 'eraser'){
                pen_path = g_icon_path + 'eraser_on.png';
                pen_opposite_path = g_icon_path + 'eraser_off.png';
            }
            else{
                pen_opposite_path = g_icon_path + 'pen' + '_off' + pen_opposite_type + '.png';
            }

            // change pen color
            if(g_is_bold_pen_thickness === false){
                $("#pen_thin").children('img').attr('src', pen_path);
                $("#pen_bold").children('img').attr('src', pen_opposite_path);
            }
            else{
                $("#pen_bold").children('img').attr('src',  pen_path);
                $("#pen_thin").children('img').attr('src', pen_opposite_path);

            }
        }
    }
}

const setPallet = pallet => {
    g_selected_pallet = pallet;
    updatePallet();
}
const setEffect = effect => {
    let selected_effect = effect;
    for(let id in EFFECTS){
        if(id == selected_effect){
            EFFECTS[id].frag = !EFFECTS[id].frag;
            const type = EFFECTS[id].frag === true? "on" : "off";
            $("#" + id).children('img').attr("src",EFFECTS[id][type]);
        }
    }
    postEffect();
}

const setJson = filepath =>{
    var json = $.getJSON(filepath, function(json) {

        led = json["led"]
        for(let x = 0; x < g_led_req_params.length; ++x){
            for(let y = 0; y < g_led_req_params[x].length; ++y){
                pallet = searchPallet("led", led[x][y])
                setCell(x, y, pallet)
            }
        }
    });;
}

const setImage = filepath => {

    var img = document.createElement('img');
    img.src = filepath;
    var canvas = document.createElement('canvas');
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        console.log("w : "+ canvas.width +" h : " + canvas.height);
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0 );
        var imageData = context.getImageData(0,0,16,32);
        console.log("iamgeData.length : " + imageData.length);
        for(let x = 0; x < g_led_req_params.length; ++x){
            for(let y = 0; y < g_led_req_params[x].length; ++y){
                var rgb = [
                   imageData.data[(x +y * 16) * 4],
                    imageData.data[(x +y * 16) * 4 + 1],
                    imageData.data[(x +y * 16) * 4 + 2]
                ];
                console.log(rgb);
                var colorCode = convertToColorCodeFromRGB(rgb);
                console.log("(x, y) : ("+x+","+y+")"+"colorCode : " + colorCode);
                setCellFromColorCode(x, y, colorCode);
            }
        }
    }
}

const setStamp = stamp => {
    var stamp_url;
    for(let id in STAMPS){
        if(id == stamp){
            stamp_url = STAMPS[id].url;
        }
    }
    if(stamp_url.endsWith("png")){
        setImage(stamp_url)
    }
    else{
        setJson(stamp_url)
    }
}
function convertToColorCodeFromRGB ( rgb ) {
	return rgb.map( function ( value ) {
		return ( "0" + value.toString( 16 ) ).slice( -2 ) ;
	} ).join( "" ) ;
}

const searchPallet = (key, value) => {
    for(let pallet in PALLETS){
        if(value === PALLETS[pallet][key]){
            return pallet;
        }
    }
    return undefined;
}

const updateWindow = () => {
    $(".cell").css("width", CELL_WIDTH).css("height", CELL_HEIGHT);
}

const isInRangeOfCanvas = (x, y) =>{
    if(x<0 || x>=16){
        return false;
    }
    if(y<0 || y>=32){
        return false;
    }
    return true;
}

const setCell = (x, y, pallet) => {
    if(!isInRangeOfCanvas(x, y)){
        return
    }
    const id = "#cell_" + x + "_" + y;
    $(id).css("background-color", PALLETS[pallet].color);
    g_drawing_buffer.push({ 'x' : x, 'y': y, 'color': PALLETS[pallet].led })
    g_led_req_params[x][y] = PALLETS[pallet].led;
}

const setCellFromColorCode = (x, y, colorCode) =>{
    if(!isInRangeOfCanvas(x, y)){
        return
    }
    g_led_req_params[x][y] = colorCode;
    g_drawing_buffer.push({ 'x' : x, 'y': y, 'color': g_led_req_params[x][y] })
    const id = "#cell_" + x + "_" + y;
    if(colorCode == "000000"){
        colorCode = "transparent";
    }
    $(id).css("background-color", colorCode);
}
const updateCellColor = event => {
    var coordinate = getCellCoordinate(event);
    const x = coordinate.x;
    const y = coordinate.y;
    setCell(x, y, g_selected_pallet);
}
const updateCellColorBold = event => {
    var coordinate = getCellCoordinate(event);
    const x = coordinate.x;
    const y = coordinate.y;
    setCell(x, y, g_selected_pallet);
    setCell(x-1, y, g_selected_pallet);
    setCell(x+1, y, g_selected_pallet);
    setCell(x, y-1, g_selected_pallet);
    setCell(x, y+1, g_selected_pallet);
}
const getCellCoordinate = event => {
    const p0 = $("#cells").offset();
    let p1 = undefined;
    if(is_mobile_dvice()){
        p1 = event.changedTouches[0];
    } else {
        p1 = event;
    }
    const x = Math.floor((p1.pageX - p0.left) / (CELL_WIDTH + 3.6));
    const y = Math.floor((p1.pageY - p0.top) / (CELL_HEIGHT + 3.6));
    var coordinate = {x: x,y: y};
    return coordinate;
}
const clearCells = () => {
    for(let x = 0; x < g_led_req_params.length; ++x){
        for(let y = 0; y < g_led_req_params[x].length; ++y){
            setCell(x, y, "pallet11");
        }
    }
//    postCells()
}

const postCell = () =>{

    if (g_drawing_buffer.length == 0){
        return;
    }

    var buffer = []
    for(var i = 0; i<g_drawing_buffer.length; i++){
        buffer.push(g_drawing_buffer[i])
    }
    g_drawing_buffer = []
    $.ajax({
        url:g_localhost + 'api/led',
        type:'POST',
        contentType:'application/json',
        data:JSON.stringify({ points : buffer})
    }).done(function(data){
        console.log("api/led post success");
        console.log("data : " + data);
    }).fail(data => {});
}

const postEffect = () =>{
    var obj = [];
    for(let id in EFFECTS){
        if(EFFECTS[id].frag){
            obj.push({'id' : EFFECTS[id].filter},)
        }
    }
    console.log(obj);
    var json_data = {
        'filters' : obj
    };
    console.log(json_data);
    $.ajax({
        url:g_localhost + 'api/filters',
        type:'POST',
        contentType:'application/json',
        data:JSON.stringify(json_data)
    }).done(function(data){
        console.log("api/filters post success");
        console.log("data : " + data);
    }).fail(data => {});
}
const postCells = () => {
    const now = Date.now();
    if(now - g_last_update  < 80){
        return;
    }
    g_last_update = now;
    $.ajax({
        url:g_localhost + 'api/led',
        type:'POST',
        contentType:'application/json',
        data:JSON.stringify({ 'led' : g_led_req_params })
    }).done(function(data){
        console.log("api/led post success");
        console.log("data : " + data);
    }).fail(data => {});
}
const savePicture = () =>{
    for(let x = 0; x < g_led_req_params.length; ++x){
        for(let y = 0; y < g_led_req_params[x].length; ++y){
            g_saved_stamp_params[x][y] = g_led_req_params[x][y];
            console.log("x : " + x);
            console.log("y : " + y);
            console.log("color : " + g_saved_stamp_params[x][y]);
        }
    }
    postSavedPicture();
}
const postSavedPicture = () =>{
    var obj = {
        'stamp_params' : g_saved_stamp_params
    }
    console.log(obj);
    $.ajax({
        url:g_localhost + 'api/stamp',
        type:'POST',
        contentType:'application/json',
        data:JSON.stringify(obj)
    }).done(function(data){
        console.log("api/stamp post success");
        console.log("data : " + data);
    }).fail(data => {});
}

function preventDefault(e){
    e.preventDefault();
}

function disableScroll(){
    document.body.addEventListener('touchmove', preventDefault, { passive: false });
}
function setPenThickness() {
    // const img_bold = $("<img>").attr("border", 0).attr("src", g_icon_path+"pen_off_L.png").attr("width", "50px").attr("height", "50px");
    const img_thin = $("<img>").attr("border", 0).attr("src", g_icon_path+"pen_red.png").attr("width", "50px").attr("height", "50px");
    $("#pen_thin").on(get_touch_event_key(),event =>{ 
        g_is_bold_pen_thickness=false;
        updatePallet();
    }).append(img_thin);
    
    // $("#pen_bold").on(get_touch_event_key(),event => {
    //     g_is_bold_pen_thickness=true;
    //     updatePallet();
    // }).append(img_bold);
}
function clearEffects() {
    for(let id in EFFECTS){
        EFFECTS[id].frag = false;
        $("#" + id).children('img').attr("src",EFFECTS[id].off);
    }
    postEffect();
}
function pressStamp(id) {
    $("#" + id).children('img').attr("src",STAMPS[id].press);
}
function endPressStamp(id){
    $("#" + id).children('img').attr("src",STAMPS[id].off);
}
function pressTrash(id){
    $("#" + id).children('img').attr("src",g_icon_path + 'trash_on.png');
}
function endPressTrash(id){
    $("#" + id).children('img').attr("src",g_icon_path + 'trash_off.png');
}
function pushHistoryList(){
    g_led_history_list.push(g_led_req_params);
}
function pressTool(id){
    $("#" + id).children('img').attr("src",TOOLS[id].press);
}
function endPressTool(id){
    $("#" + id).children('img').attr("src",TOOLS[id].off);
}
function undo(){
    console.log("call undo()")
    g_led_req_params = g_led_history_list[g_led_history_list.length -1];
    g_led_history_list.pop();
    for(let x = 0; x < g_led_req_params.length; ++x){
        for(let y = 0; y < g_led_req_params[x].length; ++y){
            setCellFromColorCode(x,y,g_led_req_params[x][y]);
        }
    }
    postCells();
}
function trash() {
    clearCells();
    clearEffects();
}
$(document).ready(() => {
    disableScroll();
    $("#header").append(
        $("<img>").attr("border", 0).attr("src","static/assets/header/Draw_to_Like_Header.png")
        .attr("width", "768px").attr("height", "96px"));
    $("#cells").on(get_touch_event_key(), event => {
        pushHistoryList();
        if(g_is_bold_pen_thickness){
            updateCellColorBold(event);
        } else {
            updateCellColor(event);
        }
    }).on("touchmove", event => {
        if(g_is_bold_pen_thickness){
            updateCellColorBold(event);
        } else {
            updateCellColor(event);
        }
    });
    g_led_req_params = new Array(16);
    g_saved_stamp_params = new Array(16);
    for(let x = 0; x < g_led_req_params.length; ++x) {
        g_led_req_params[x] = new Array(32).fill(0);
        g_saved_stamp_params[x] = new Array(32).fill(0);
    }
    g_led_history_list = [g_led_history_list];
    pushHistoryList();
    clearCells();
    setPenThickness();
    for(let id in PALLETS){
        const obj = $("#" + id);
        obj.addClass("pallet");
        if(id === "pallet11"){
            const img = $("<img>").attr("border", 0).attr("src", "static/assets/trash.png").attr("width", "62.5px").attr("height", "62.5px");
            obj.on(get_touch_event_key(),event => {clearCells(),clearEffects(),pressTool(id)}).
            on("touchend",event => endPressTool(id)).append(img);
        } else {
            const img = $("<img>").attr("border", 0).attr("src", "static/assets/eraser.png").attr("width", "62.5px").attr("height", "62.5px");
            obj.on(get_touch_event_key(), event => setPallet(id)).on("touchmove", event => setPallet(id)).append(img);
        }
    }
    for(let id in TOOLS){
        const obj = $("#" + id);
        const off = TOOLS[id].off;
        const img = $("<img>").attr("border", 0).attr("src",off).attr("width", "87.5px").attr("height", "96px");
        obj.on(get_touch_event_key(),event => {clearCells(),clearEffects(),pressTool(id)}).
        on("touchend",event => endPressTool(id)).append(img);
    }
    for(let id in EFFECTS){
        const obj = $("#" + id);
        const off = EFFECTS[id].off;
        const img = $("<img>").attr("border", 0).attr("src", off).attr("width", "128px").attr("height", "104px");
        obj.addClass("effect").on(get_touch_event_key(), event => setEffect(id)).append(img);
    }
    for(let id in STAMPS){
        const obj =$("#" + id);
        const off = STAMPS[id].off;
        const img = $("<img>").attr("border", 0).attr("src", off).attr("width", "66px").attr("height", "66px");
        obj.addClass("stamp").on(get_touch_event_key(),event => {setStamp(id),pressStamp(id)}).
        on("touchend",event => endPressStamp(id)).append(img);
    }
    setPallet("pallet0");
    updateWindow();
    $(window).resize(() => {
        updateWindow();
    });

    setInterval(postCells, 10000); // update all
    setInterval(postCell, 100); // send pixels if updates exists.
});
