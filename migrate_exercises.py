import json
import os
import shutil
import re

# Configuración
SOURCE_JSON = '../exercises.json-master/ejercicios_es.json'
SOURCE_IMAGES_DIR = '../exercises.json-master/exercises'
DEST_IMAGES_DIR = './images/exercises'
OUTPUT_JS_FILE = './exercises-database.js'

# Mapeo de músculos a categorías de la app
MUSCLE_MAP = {
    'bíceps': 'brazos',
    'tríceps': 'brazos',
    'antebrazos': 'brazos',
    'cuádriceps': 'piernas',
    'isquiotibiales': 'piernas',
    'pantorrillas': 'piernas',
    'glúteos': 'piernas',
    'aductores': 'piernas',
    'abductores': 'piernas',
    'abdominales': 'core',
    'dorsales': 'espalda',
    'espalda baja': 'espalda',
    'espalda media': 'espalda',
    'trapecios': 'espalda',
    'pecho': 'pecho',
    'hombros': 'hombros',
    'cuello': 'hombros'
}

# Filtros
ALLOWED_EQUIPMENT = ['máquina', 'mancuerna']

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_folder_name(exercise_name):
    # Reemplazar espacios con guiones bajos, eliminar caracteres especiales si los hay
    # En el repo original parece que solo reemplazan espacios por _ y mantienen mayúsculas
    # Pero algunos caracteres como "/" se reemplazan o eliminan.
    # Ej: "3/4 Sit-Up" -> "3_4_Sit-Up"
    name = exercise_name.replace(' ', '_')
    name = name.replace('/', '_')
    return name

def migrate():
    data = load_json(SOURCE_JSON)
    exercises = data['ejercicios']
    
    migrated_exercises = []
    count = 0
    
    print(f"Total ejercicios encontrados: {len(exercises)}")
    
    for ex in exercises:
        # Filtrar por equipamiento
        if ex.get('equipamiento') not in ALLOWED_EQUIPMENT:
            continue
            
        name = ex['nombre']
        folder_name = get_folder_name(name)
        source_img_path = os.path.join(SOURCE_IMAGES_DIR, folder_name, 'images')
        
        # Verificar si existen imágenes
        images = []
        if os.path.exists(source_img_path):
            # Crear directorio destino para este ejercicio
            dest_ex_dir = os.path.join(DEST_IMAGES_DIR, folder_name)
            if not os.path.exists(dest_ex_dir):
                os.makedirs(dest_ex_dir)
                
            # Copiar imágenes 0.jpg y 1.jpg si existen
            for img_name in ['0.jpg', '1.jpg']:
                src = os.path.join(source_img_path, img_name)
                if os.path.exists(src):
                    dst = os.path.join(dest_ex_dir, img_name)
                    shutil.copy2(src, dst)
                    images.append(f"images/exercises/{folder_name}/{img_name}")
        
        # Mapear músculo
        primary_muscle = ex['musculosPrimarios'][0] if ex['musculosPrimarios'] else 'otro'
        app_muscle = MUSCLE_MAP.get(primary_muscle, 'otro')
        
        # Crear objeto ejercicio
        new_ex = {
            'id': count + 1, # ID secuencial simple
            'name': name,
            'muscle': app_muscle,
            'equipment': ex['equipamiento'],
            'images': images,
            'instructions': ex.get('instrucciones', []),
            'original_muscle': primary_muscle # Guardamos el específico por si acaso
        }
        
        migrated_exercises.append(new_ex)
        count += 1
        
    print(f"Ejercicios migrados: {count}")
    
    # Generar archivo JS
    js_content = f"""// Base de datos de ejercicios generada automáticamente
// Total ejercicios: {count}

const ExercisesDatabase = {json.dumps(migrated_exercises, indent=4, ensure_ascii=False)};

const MuscleGroups = {{
    PECHO: 'pecho',
    ESPALDA: 'espalda',
    PIERNAS: 'piernas',
    BRAZOS: 'brazos',
    HOMBROS: 'hombros',
    CORE: 'core'
}};

const EquipmentTypes = {{
    BARRA: 'barra',
    MANCUERNAS: 'mancuerna',
    MAQUINA: 'máquina',
    POLEA: 'polea',
    CORPORAL: 'peso_corporal',
    CARDIO: 'cardio'
}};

// Exportar para uso global
window.ExercisesDatabase = ExercisesDatabase;
window.MuscleGroups = MuscleGroups;
window.EquipmentTypes = EquipmentTypes;
"""

    with open(OUTPUT_JS_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Archivo generado: {OUTPUT_JS_FILE}")

if __name__ == '__main__':
    migrate()
