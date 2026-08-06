const { InventoryItem } = require("../models");
const { logAction } = require("../utils/audit");

exports.getAllItems = async (req, res) => {
  try {
    const items = await InventoryItem.findAll({ order: [["name", "ASC"]] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inventory.", error: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body);
    await logAction(req, { action: "create", entity: "InventoryItem", entityId: item.id, details: { name: item.name } });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to create item.", error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found." });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to update item.", error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found." });
    await item.destroy();
    res.json({ message: "Item deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item.", error: err.message });
  }
};
