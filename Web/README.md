## main.py

# Download library (IA 3D model)
```bash
pip3 install -r depthMap/requirements.txt
```

# Activating venv :

Normalement toutes les librairies sont installées sur l'environnement virtuel donc pas besoin de les télecharger, seulement faire les commandes suivantes

```bash
source venv/bin/activate
```

# Set Flask app :
```bash
set FLASK_APP=main # c'est le nom de l'app
```
 
# Launch Server
```bash
python3 main.py 
```

Dans la barre du moteur de recherche 'http:/127.0.0.1:5000/home' pour lancer la page d'acceuil
Si vous etes pas sur une machine virtuelle, le site devrait marcher en local, sinon seulement sur le pc

# Changer les parametres

Dans main.py, il y'a 3 variables globales a modifier pour changer les données envoyer a l'arduino 
longueur, largeur, depthRange pour changer les dimensions du tableau et l'encadrement des valeurs de profondeurs

## Sending data 

Fichier arduinoConnect.py permet d'envoyer directement un fichier txt a l'arduino

Exemple 
```bash
python3 arduinoConnect.py static/txt/chouette.txt
```