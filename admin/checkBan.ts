import fs from 'fs';

type PhoneEntry = [string, string]; // Définition du type pour chaque entrée dans le fichier JSON

export default function isBan(phoneNumber: string): boolean {
  const jsonFile = './admin/ban.json'; // Nom du fichier JSON

  let isBanned = false; // Variable pour stocker si le numéro est interdit

  try {
    const data = fs.readFileSync(jsonFile, 'utf8');
    let entries: PhoneEntry[] = JSON.parse(data);
	if (entries.length == 0){return false}
    let newEntries: PhoneEntry[] = [];

    for (let ban of entries) {
      if (new Date(ban[1]).getTime() > Date.now()) {
        newEntries.push(ban);
        if (ban[0] == phoneNumber) {
          isBanned = true;
          return true;
        }
      }
    }

    // Mise à jour du fichier JSON
    const updatedData = JSON.stringify(newEntries);
    fs.writeFileSync(jsonFile, updatedData, 'utf8');
  } catch (err) {
    console.error(`Une erreur s'est produite lors de la lecture du fichier ${jsonFile}: ${err}`);
    return true;
  }

  return isBanned; // Renvoie si le numéro est interdit
}
