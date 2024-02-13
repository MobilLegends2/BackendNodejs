import Section from '../models/section.js';


export function deleteSectionById(req, res) {
  Section.findByIdAndDelete(req.params.id)
      .then((section) => {
        if (!section) {
          res.status(404).json({ message: 'Section not found' });
        } else {
          res.status(200).json({ message: 'Section deleted successfully' });
        }
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  }
  