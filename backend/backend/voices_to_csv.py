headers = ['id', 'shape id', 'age', 'gender', 'education', 'birth place', 'current place', 'non native', 'area name', 'sound example', 'associations', 'correctness', 'friendliness', 'pleasantness', 'trustworthiness']
EDUCATION = {
        '1': 'High school or lower',
        '2': 'Bachelors',
        '3': 'Masters',
        '4': 'Doctorate'
        }
NON_NATIVE = {
        '1': 'Less than two years',
        '2': '3-5 years',
        '3': '6-10 years',
        '4': '10+ years'
        }
AGE = {
        '1': '16 - 17',
        '2': '18 - 25',
        '3': '26 - 45',
        '4': '46 - 65',
        '5': '66 - 75',
        '6': '75+'
        }

def map_entry_to_rows(entry, _id):
    pi = entry['personalInformation']
    personalInformation = [
            AGE[pi['age']],
            pi['genderCustom'] if pi['gender'] == 'other' else pi['gender'],
            ', '.join(list(map(lambda e: EDUCATION[e], pi['levelEducation']))),
            pi['birthPlace'],
            pi['currentPlace'],
            NON_NATIVE.get(pi['nonNative'], '-'),
            ]
    for i, subentry in enumerate(entry['canvas']):
        form = subentry['form']
        ret = personalInformation + [
                form['name'],
                form['soundExample'] or '-',
                ', '.join(form['associations']),
                form['correctness'],
                form['friendliness'],
                form['pleasantness'],
                form['trustworthiness']
                ]
        yield [_id, i] + ret
