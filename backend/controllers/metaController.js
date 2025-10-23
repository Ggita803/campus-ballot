const User = require('../models/User');

const getFaculties = async (req, res) => {
  try {
    const faculties = await User.distinct('faculty');
    // Filter out null/empty
    const cleaned = faculties.filter(f => f && String(f).trim().length > 0);
    res.json(cleaned);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch faculties', error: err.message });
  }
};

const getCohorts = async (req, res) => {
  try {
    const cohorts = await User.distinct('yearOfStudy');
    const cleaned = cohorts.filter(c => c && String(c).trim().length > 0);
    res.json(cleaned);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cohorts', error: err.message });
  }
};

module.exports = {
  getFaculties,
  getCohorts,
};
