(async () => {
  try {
    const { makeWASocket, useMultiFileAuthState, delay, DisconnectReason } = await import("@whiskeysockets/baileys");
    const fs = await import('fs');
    const pino = (await import('pino')).default;
    const rl = (await import("readline")).createInterface({ input: process.stdin, output: process.stdout });
    
    const question = (text) => new Promise((resolve) => rl.question(text, resolve));

    const reset = "\x1b[0m"; 
    const green = "\x1b[1;32m"; 
    const yellow = "\x1b[1;33m"; 

    const logo = `${yellow}
 < ROYAL PUNJAB RULEX > OWNER SEERAT BRAND 
 ----------------------------------------------
    \
     \
                                   .::!!!!!!!:.
  .!!!!!:.                        .:!!!!!!!!!!!!
  ~~~~!!!!!!.                 .:!!!!!!!!!UWWW$$$
      :$$NWX!!:           .:!!!!!!XUWW$$$$$$$$$P
      $$$$$##WX!:      .<!!!!UW$$$$"  $$$$$$$$#
      $$$$$  $$$UX   :!!UW$$$$$$$$$   4$$$$$*
      ^$$$B  $$$$\     $$$$$$$$$$$$   d$$R"
        "*$bd$$$$      '*$$$$$$$$$$$o+#"
             """"          """""""
  _____ ______ ______ _____         _______
  / ____|  ____|  ____|  __ \     /\|__   __|
 | (___ | |__  | |__  | |__) |   /  \  | |
  \___ \|  __| |  __| |  _  /   / /\ \ | |
  ____) | |____| |____| | \ \  / ____ \| |
 |_____/|______|______|_|  \_\/_/    \_\_                                                                           

============================================
[~] Author  : TRICKER S33R9T BRAND 
[~] GitHub  : CRIMINAL S33R9T 
[~] Tool  : Seerat WhatsApp Message Sender
============================================`;

    const clearScreen = () => {
      console.clear();
      console.log(logo);
    };

    let targetNumbers = [];
    let groupUIDs = [];
    let messages = null;
    let intervalTime = null;
    let haterName = null;
    let lastSentIndex = 0;

    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    async function sendMessages(MznKing) {
      while (true) {
        for (let i = lastSentIndex; i < messages.length; i++) {
          try {
            const currentTime = new Date().toLocaleTimeString();
            const fullMessage = `${haterName} ${messages[i]}`;

            if (targetNumbers.length > 0) {
              for (const targetNumber of targetNumbers) {
                await MznKing.sendMessage(targetNumber + '@c.us', { text: fullMessage });
                console.log(`${orange}Target Number => ${reset}${targetNumber}`);
              }
            } else {
              for (const groupUID of groupUIDs) {
                await MznKing.sendMessage(groupUID + '@g.us', { text: fullMessage });
                console.log(`${yellow}Group UID => ${reset}${groupUID}`);
              }
            }

            console.log(`${yellow}Time => ${reset}${currentTime}`);
            console.log(`${yellow}Message => ${reset}${fullMessage}`);
            console.log('    [ =============== S33R9T BRAND =============== ]');
            await delay(intervalTime * 1000);
          } catch (sendError) {
            console.log(`${yellow}Error sending message: ${sendError.message}. Retrying...${reset}`);
            lastSentIndex = i;
            await delay(5000); 
          }
        }
        lastSentIndex = 0; 
      }
    }

    const connectToWhatsApp = async () => {
      const MznKing = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state, 
      });

      if (!MznKing.authState.creds.registered) {
        clearScreen(); 
        const phoneNumber = await question(`${yellow}[+] Enter Your Phone Number => ${reset}`);
        const pairingCode = await MznKing.requestPairingCode(phoneNumber); 
        clearScreen();
        console.log(`${yellow}[√] Your Pairing Code Is => ${reset}${pairingCode}`);
      }

      MznKing.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection === "open") {
          clearScreen(); 
          console.log(`${yellow}[Your WhatsApp Login ✓]${reset}`);

          const sendOption = await question(`${yellow}[1] Send to Target Number\n[2] Send to WhatsApp Group\nChoose Option => ${reset}`);

          if (sendOption === '1') {
            const numberOfTargets = await question(`${yellow}[+] How Many Target Numbers? => ${reset}`);
            for (let i = 0; i < numberOfTargets; i++) {
              const targetNumber = await question(`${yellow}[+] Enter Target Number ${i + 1} => ${reset}`);
              targetNumbers.push(targetNumber); 
            }
          } else if (sendOption === '2') {
            const groupList = await MznKing.groupFetchAllParticipating();
            const groupUIDsList = Object.keys(groupList);
            console.log(`${yellow}[√] WhatsApp Groups =>${reset}`);
            groupUIDsList.forEach((uid, index) => {
              console.log(`${yellow}[${index + 1}] Group Name: ${reset}${groupList[uid].subject} ${green}UID: ${reset}${uid}`);
            });

            const numberOfGroups = await question(`${yellow}[+] How Many Groups to Target => ${reset}`);
            for (let i = 0; i < numberOfGroups; i++) {
              const groupUID = await question(`${yellow}[+] Enter Group UID ${i + 1} => ${reset}`);
              groupUIDs.push(groupUID); 
            }
          }

          const messageFilePath = await question(`${green}[+] Enter Message File Path => ${reset}`);
          messages = fs.readFileSync(messageFilePath, 'utf-8').split('\n').filter(Boolean);
          haterName = await question(`${yellow}[+] Enter Hater Name => ${reset}`);
          intervalTime = await question(`${yellow}[+] Enter Message Delay => ${reset}`);

          console.log(`${yellow}All Details Are Filled Correctly${reset}`);
          clearScreen(); 
          console.log(`${yellow}Now Start Message Sending.......${reset}`);
          console.log('      [ =============== S33R9T BRAND RUNING=============== ]');
          console.log('');

          await sendMessages(MznKing);
        }

        if (connection === "close" && lastDisconnect?.error) {
          const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) {
            console.log("Network issue, retrying in 5 seconds...");
            setTimeout(connectToWhatsApp, 5000); 
          } else {
            console.log("Connection closed. Please restart the script.");
          }
        }
      });

      MznKing.ev.on('creds.update', saveCreds);
    };

    await connectToWhatsApp();

    process.on('uncaughtException', function (err) {
      let e = String(err);
      if (e.includes("Socket connection timeout") || e.includes("rate-overlimit")) return;
      console.log('Caught exception: ', err);
    });

  } catch (error) {
    console.error("Error importing modules:", error);
  }
})();
