import Orphanage from '../models/Orphanage'
import orphanageView from '../views/orphanages_view'
import { getRepository } from 'typeorm'
import { Request, Response } from 'express'
import * as Yup from 'yup'

export default {
  async index(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphanage)
    const orphanages = await orphanagesRepository.find({ relations: ["images"] })
    return response.json(orphanageView.renderMany(orphanages))
  },
  async create(request: Request, response: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      opening_on_weekends,
    } = request.body

    const orphanagesRepository = getRepository(Orphanage)

    const requestImages = request.files as Express.Multer.File[]

    const images = requestImages.map(image => {
      return { path: image.filename }
    })

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      opening_on_weekends: opening_on_weekends === 'true',
      images
    }

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
      about: Yup.string().required().max(300),
      instructions: Yup.string().required(),
      opening_hours: Yup.string().required(),
      opening_on_weekends: Yup.boolean().required(),
      images: Yup.array(Yup.object().shape({
        path: Yup.string().required()
      }))
    })

    await schema.validate(data, {
      abortEarly: false
    })

    const orphanage = orphanagesRepository.create(data)

    await orphanagesRepository.save(orphanage)

    return response.status(201).json({ message: "Created sucessfully!" })
  },
  async show(request: Request, response: Response) {
    const { id } = request.params

    const orphanagesRepository = getRepository(Orphanage)

    const orphanage = await orphanagesRepository.findOneOrFail(id, { relations: ["images"] })

    return response.json(orphanageView.render(orphanage))
  },
  async delete(request: Request, response: Response) {
    const { id } = request.params

    const orphanageRepository = getRepository(Orphanage)

    const orphanage = await orphanageRepository.findOne(id)

    if (orphanage && Object.keys(orphanage).length > 0) {
      orphanageRepository.delete(id)
      return response.json({ message: 'Data successfully deleted.' })
    }

    return response.status(404).json({ message: 'No orphanage found with this id.' })
  }
}