import { makeId, readJsonFile, writeJsonFile } from "./utils.js"

export const carService = {
    query,
    getById,
    remove,
    save
}

const cars = readJsonFile('./data/cars.json')


async function query(filterBy = {}) {
    try {
        return cars
    } catch (err) {
        throw err
    }
}

async function getById(carId) {
    try {
        const car = cars.find(car => car._id === carId)
        if (!car) throw new Error('Cannot find car')
        return car
    } catch (err) {
        throw err
    }
}

async function remove(carId) {
    try {

        const carIdx = cars.findIndex(car => car._id === carId)
        if (carIdx < 0) throw new Error('Cannot find car')
        cars.splice(carIdx, 1)
        await _saveCarsToFile()
    } catch (err) {
        throw err
    }

}

async function save(carToSave) {
    try {
        if (carToSave._id) {
            const carIdx = cars.findIndex(car => car._id === carToSave._id)
            if (carIdx < 0) throw new Error('Cannot find car')
            cars[carIdx] = carToSave
        } else {
            carToSave._id = makeId()
            cars.push(carToSave)
        }
        await _saveCarsToFile()
        return carToSave
    } catch (err) {
        throw err
    }
}


function _saveCarsToFile() {
    return writeJsonFile('./data/cars.json', cars)
}