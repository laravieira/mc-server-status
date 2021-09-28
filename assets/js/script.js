function show(id) {
    document.getElementById(id).style.display = 'block';
}

function hide(id) {
    document.getElementById(id).style.display = 'none';
}

function status(id, to) {
    if(id == 'global') {
        status('dns', to);
        status('host', to);
        status('server', to);
    
    }else if(to === true) {
        hide(id+'-status-error');
        hide(id+'-status-refresh');
        show(id+'-status-done');
    }else if(to === false) {
        statusColor(id, to);
        hide(id+'-status-done');
        hide(id+'-status-refresh');
        show(id+'-status-error');
    }else {
        statusColor(id, to);
        hide(id+'-status-done');
        hide(id+'-status-error');
        show(id+'-status-refresh');
    }
}

function statusColor(id, green) {
    if(green != false && green !== null)
        document.getElementById(id+'-header').style.background = 'var(--green)';
    else if(green == false && green !== null)
        document.getElementById(id+'-header').style.background = 'var(--l-red)';
    else
        document.getElementById(id+'-header').style.background = 'var(--blue)';
}

function year() {
    var year = new Date().getFullYear();
    if(year != '2020')
        document.getElementById('year').innerHTML = '- '+year+' ';
}

function copy() {
    var ip = document.querySelector('#ip');
    ip.select();
    try{
        document.execCommand('copy'); // Depreciated
    }catch(e) {
        ip.textContent = ip.getAttribute('value');
        console.error('Fail to copy with execCommand.');
    }finally {
        document.getElementById('copy').innerText = 'IP copiado!';
        ip.textContent = ip.getAttribute('value');
    }
    try{
        navigator.clipboard.writeText(ip.textContent);
    }catch(e) {
        ip.textContent = ip.getAttribute('value');
        console.error('Fail to copy with Clipboard API.');
    }finally {
        document.getElementById('copy').innerText = 'IP copiado!';
        ip.textContent = ip.getAttribute('value');
    }
}

function get(url, id) {
    status(id, null);

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onerror = function() {
        status(id, false);
    }

    xmlhttp.onreadystatechange = function() {
        if(this.response !== null) {
            if(id == 'dns')
                updateDNS(this.response);
            else if(id == 'host')
                updateHost(this.response);
            else if(id == 'server')
                updateServer(this.response);
            else if(id == 'global')
                updateGlobal(this.response);
        }
    };

    xmlhttp.responseType = 'json';
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function updateGlobal(data) {
    updateDNS(data.debug);
    updateHost(data);
    updateServer(data);
}

function updateDNS(data) {
    var content = document.getElementById('dns-content');
    content.innerHTML = '<p>'
    +'<b>Query:</b> '+(data.query?'ON':'OFF')
    +'<br><b>SRV:</b> '+(data.srv?'ON':'OFF')
    +'<br><b>IP in SRV:</b> '+(data.ipinsrv?'ON':'OFF')
    +'<br><b>Querymismatch:</b> '+(data.querymismatch?'ON':'OFF')
    +'<br><b>CNAME in SRV:</b> '+(data.cnameinsrv?'ON':'OFF')
    //+'<br><b>Cache Time:</b> '+time(data.cachetime)
    +'</p>';

    status('dns', true);
    statusColor('dns', data.srv);
}

function updateHost(data) {
    var content = document.getElementById('host-content');
    content.innerHTML = '<p>'
    +'<b>Ping:</b> '+(data.ping?'ON':'OFF')
    +'<br><b>Animated MOTD:</b> '+(data.animatedmotd?'ON':'OFF')
    //+'<br><b>Cache Time:</b> '+time(data.debug.cachetime)
    +'</p>';
    
    status('host', true);
    statusColor('host', data.ip);
}

function updateServer(data) {
    var content = document.getElementById('server-content');
    var string = '<p>'+'<b>Status:</b> '+(data.online?'Online':'Offline');
    status('server', true);
    statusColor('server', data.online);

    if(data.online) {
        var players = '';
        for(var i = 0; i < data.players.online; i++) {
            if(i == 0) players = data.players.list[0];
            else players = ', '+data.players.list[i];
        }

        content.innerHTML = string
        +'<br><b>MOTD:</b> '+(data.motd.clean)
        +'<br><b>Players:</b> <span title="'+players+'">'+(data.players.online)+'/'+(data.players.max)+'</span>'
        +'<br><b>Versão:</b> '+(data.version)
        +'<br><b>Software:</b> <span title="'+(data.software)+'">'+(data.software.substr(0, 15))+'</span>...'
        //+'<br><b>Cache Time:</b> '+time(data.debug.cachetime)
        +'</p>';
    }else {
        content.innerHTML = string
        //+'<br><b>Cache Time:</b> '+time(data.debug.cachetime)
        +'</p>';
    }
}

function init() {
    year();
    get('https://api.mcsrvstat.us/2/play.laravieira.me', 'global');
}

window.onload = init;