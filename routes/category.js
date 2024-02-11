import express from 'express';
import Category from '../models/category.js' // Assuming this is the file containing the Category model
import Section from '../models/section.js';
import {deleteCategoryById} from '../controllers/category.js'

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().populate({
      path: 'sections.section',
      select: 'title'
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const category = new Category({
    name: req.body.name,
    sections: req.body.sections
  });

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', getCategory, (req, res) => {
  res.json(res.category);
});

router.patch('/:id', getCategory, async (req, res) => {
  if (req.body.name != null) {
    res.category.name = req.body.name;
  }
  if (req.body.sections != null) {
    res.category.sections = req.body.sections;
  }

  try {
    const updatedCategory = await res.category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", deleteCategoryById);


async function getCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (category == null) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.category = category;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export default router;
