import random
import json

def generate_dataset_modified(n):
    dataset = []
    for _ in range(n):
        q1 = round(random.triangular(-20, 20, 0))
        q2 = q1 + round(random.triangular(-20, 20, 0))
        q3 = q2 + round(random.triangular(-20, 20, 0))
        q4 = q3 + round(random.triangular(-20, 20, 0))

        record = {"Q1": q1, "Q2": q2, "Q3": q3, "Q4": q4}
        if q4 == 0:
            record["OT1"] = round(random.triangular(-10, 10, 0))

        dataset.append(record)
    return dataset

modified_dataset = generate_dataset_modified(82)

# Adjusting the file path to the correct directory
file_path = './data/season-2022-2023.json'
with open(file_path, 'w') as file:
    json.dump(modified_dataset, file, indent=4)
