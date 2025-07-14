function processLines(prefixEnv, input) {
    return input.trim().split('\n').filter(Boolean).map(line => {
      const parts = line.split('|');
      if (parts.length !== 2) return null; // skip invalid lines
      const [host, mount] = parts.map(s => s.trim());
      if (!host || !mount) return null;    // skip if either is empty
      return `        - \${ANGEL_COLLECTION}/${host}:\${${prefixEnv}}/${mount}`;
    }).filter(Boolean); // remove any null entries
  }
  
  
  function generateCompose() {
    const puid = document.getElementById('puid').value;
    const pgid = document.getElementById('pgid').value;
    const tz = document.getElementById('tz').value;
    const config = document.getElementById('config').value;
    const sharedLibs = document.getElementById('sharedLibs').value;
  
    const tfaFlac = processLines('TFA_SHARED', document.getElementById('tfaFlac').value);
    const tfaMp3 = processLines('TFA_SHARED_MP3', document.getElementById('tfaMp3').value);
    const crackheadFlac = processLines('CRACKHEAD_SHARED', document.getElementById('crackheadFlac').value);
    const crackheadMp3 = processLines('CRACKHEAD_SHARED_MP3', document.getElementById('crackheadMp3').value);
  
    const volumes = [
      `        - ${config}:/config`,
      `        - ${sharedLibs}:/music`,
      tfaFlac.length ? `        # TFA Library - FLAC` : '',
      ...tfaFlac,
      tfaMp3.length ? `        # TFA Library - MP3` : '',
      ...tfaMp3,
      crackheadFlac.length ? `        # Crackhead Library - FLAC` : '',
      ...crackheadFlac,
      crackheadMp3.length ? `        # Crackhead Library - MP3` : '',
      ...crackheadMp3
    ].filter(Boolean).join('\n');
  
    const yaml = `services:
    syncthing:
      image: lscr.io/linuxserver/syncthing:latest
      container_name: syncthing
      hostname: syncthing
      environment:
        - PUID=${puid}
        - PGID=${pgid}
        - TZ=${tz}
      volumes:
${volumes}
      ports:
        - 8384:8384
        - 22000:22000/tcp
        - 22000:22000/udp
        - 21027:21027/udp
      restart: unless-stopped
networks: {}`;
  
    document.getElementById('output').value = yaml;
  }
  
  function loadFileToTextarea(inputElement, targetTextareaId) {
    const file = inputElement.files[0];
    if (!file || file.type !== "text/plain") {
      alert("Please upload a valid .txt file.");
      inputElement.value = "";
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result.trim();
      document.getElementById(targetTextareaId).value = content;
    };
    reader.readAsText(file);
  }
  