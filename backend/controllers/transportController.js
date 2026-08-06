const { Vehicle, TransportRoute, Student } = require("../models");
const { logAction } = require("../utils/audit");

// ---- Vehicles ----
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ order: [["vehicle_number", "ASC"]] });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vehicles.", error: err.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    await logAction(req, { action: "create", entity: "Vehicle", entityId: vehicle.id });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: "Failed to create vehicle.", error: err.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });
    await vehicle.destroy();
    res.json({ message: "Vehicle deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete vehicle.", error: err.message });
  }
};

// ---- Routes ----
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await TransportRoute.findAll({
      include: [{ model: Vehicle, attributes: ["id", "vehicle_number", "driver_name"] }],
      order: [["name", "ASC"]],
    });
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch routes.", error: err.message });
  }
};

exports.getMyRoute = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student || !student.route_id) return res.json(null);
    const route = await TransportRoute.findByPk(student.route_id, {
      include: [{ model: Vehicle, attributes: ["id", "vehicle_number", "driver_name", "driver_phone"] }],
    });
    res.json(route);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch route.", error: err.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const route = await TransportRoute.create(req.body);
    await logAction(req, { action: "create", entity: "TransportRoute", entityId: route.id, details: { name: route.name } });
    res.status(201).json(route);
  } catch (err) {
    res.status(500).json({ message: "Failed to create route.", error: err.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const route = await TransportRoute.findByPk(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found." });
    await route.update(req.body);
    res.json(route);
  } catch (err) {
    res.status(500).json({ message: "Failed to update route.", error: err.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await TransportRoute.findByPk(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found." });
    await route.destroy();
    res.json({ message: "Route deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete route.", error: err.message });
  }
};

// Assign a student to a route (or unassign with route_id: null)
exports.assignStudent = async (req, res) => {
  try {
    const { student_id, route_id } = req.body;
    const student = await Student.findByPk(student_id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    student.route_id = route_id || null;
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to assign student.", error: err.message });
  }
};
