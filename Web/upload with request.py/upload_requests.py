import requests
test_file = open("mdi.pdf","rb")
test_url1 = "https://perso.telecom-paristech.fr/lchevrier-22/index.html"
test_url2 = "https://perso.telecom-paristech.fr/imejdoub-22/"
test_response = requests.post(test_url2, files = {"form_field_name": test_file})
if test_response.ok:
    print("Upload completed successfully!")
    print(test_response.text)
else:
    print("Something went wrong!")