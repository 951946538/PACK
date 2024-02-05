from fastai.vision.all import *
import sys


model = load_learner('./classification/painting_class.plk')

Realiste = [

"Realism",
"Romanticism",
"Baroque",
"Rococo",
"Neoclassicism",
"High Renaissance",
"Mannerism (Late Renaissance)"]

dict1 = {k: 1 for k in Realiste}

Abstrait = [

"Impressionism",
"Early Renaissance",
"Expressionism",
"Post-Impressionism",
"Art Nouveau (Modern)",
"Surrealism",
"Symbolism",
"Northern Renaissance",
"Naïve Art (Primitivism)",
"Abstract Expressionism",
"Ukiyo-e",
"Cubism",
"Art Informel",
"Magic Realism"]

dict2 = {k: 0 for k in Abstrait}



dict3 = {**dict1, **dict2}

def predict( path ) :
    model = load_learner('./classification/painting_class.plk')
    name_predict = model.predict(item = path )[0] #gets model name prediction
    print(name_predict)
    return dict3[name_predict] # it will be 0 or 1


if __name__ == '__main__':
    if predict(sys.argv[1]) == 1 :
        print("realistic")
    else : print("Abstract")


