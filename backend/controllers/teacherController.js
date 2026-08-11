const { Teacher, SchoolClass, User } = require("../models");
const bcrypt = require("bcryptjs");

// GET /api/teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      include: [
        {
          model: SchoolClass,
          as: "classesHandled",
          attributes: ["id", "course_name", "department_name", "section"],
        },
      ],
      order: [["name", "ASC"]],
    });

    res.json(teachers);
  } catch (err) {
    console.error("getAllTeachers error:", err);

    res.status(500).json({
      message: "Failed to fetch teachers.",
      error: err.message,
    });
  }
};

// GET /api/teachers/:id
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [
        {
          model: SchoolClass,
          as: "classesHandled",
        },
      ],
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found.",
      });
    }

    res.json(teacher);
  } catch (err) {
    console.error("getTeacherById error:", err);

    res.status(500).json({
      message: "Failed to fetch teacher.",
      error: err.message,
    });
  }
};

// GET /api/teachers/me/profile
exports.getMyTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      where: {
        user_id: req.user.id,
      },
      include: [
        {
          model: SchoolClass,
          as: "classesHandled",
        },
      ],
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher profile not found.",
      });
    }

    res.json(teacher);
  } catch (err) {
    console.error("getMyTeacherProfile error:", err);

    res.status(500).json({
      message: "Failed to fetch profile.",
      error: err.message,
    });
  }
};

// POST /api/teachers
exports.createTeacher = async (req, res) => {
  const transaction = await Teacher.sequelize.transaction();

  try {
    const {
      name,
      email,
      phone,
      password,
      employee_id,
      subject,
      department,
      course,
      designation,
      qualification,
      joining_date,
      experience,
      employment_type,
      campus,
      status,
      address,
      emergency_contact_name,
      emergency_contact_number,
    } = req.body;

    if (!name || !name.trim()) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Teacher name is required.",
      });
    }

    if (!email || !email.trim()) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Teacher email is required.",
      });
    }

    if (!password || password.length < 6) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing login account
    const existingUser = await User.findOne({
      where: {
        email: normalizedEmail,
      },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();

      return res.status(409).json({
        message: "A user account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create login account
    const user = await User.create(
      {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "teacher",
        phone: phone || null,
        is_active: true,
      },
      {
        transaction,
      }
    );

    // Create teacher profile
    const teacher = await Teacher.create(
      {
        user_id: user.id,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone || null,
        employee_id: employee_id || null,
        subject: subject || null,
        department: department || null,
        course: course || null,
        designation: designation || null,
        qualification: qualification || null,
        joining_date: joining_date || null,
        experience: experience || null,
        employment_type: employment_type || null,
        campus: campus || null,
        status: status || "active",
        address: address || null,
        emergency_contact_name:
          emergency_contact_name || null,
        emergency_contact_number:
          emergency_contact_number || null,
      },
      {
        transaction,
      }
    );

    await transaction.commit();

    res.status(201).json({
      message: "Teacher and login account created successfully.",
      teacher,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("createTeacher error:", err);

    res.status(500).json({
      message: "Failed to create teacher.",
      error: err.message,
    });
  }
};

// PUT /api/teachers/:id
exports.updateTeacher = async (req, res) => {
  const transaction = await Teacher.sequelize.transaction();

  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      transaction,
    });

    if (!teacher) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Teacher not found.",
      });
    }

    const {
      name,
      email,
      phone,
      password,
      employee_id,
      subject,
      department,
      course,
      designation,
      qualification,
      joining_date,
      experience,
      employment_type,
      campus,
      status,
      address,
      emergency_contact_name,
      emergency_contact_number,
    } = req.body;

    // Update Teacher profile
    await teacher.update(
      {
        name: name?.trim() || teacher.name,
        email: email?.trim().toLowerCase() || teacher.email,
        phone: phone ?? teacher.phone,
        employee_id: employee_id ?? teacher.employee_id,
        subject: subject ?? teacher.subject,
        department: department ?? teacher.department,
        course: course ?? teacher.course,
        designation: designation ?? teacher.designation,
        qualification: qualification ?? teacher.qualification,
        joining_date: joining_date || null,
        experience: experience ?? teacher.experience,
        employment_type:
          employment_type ?? teacher.employment_type,
        campus: campus ?? teacher.campus,
        status: status ?? teacher.status,
        address: address ?? teacher.address,
        emergency_contact_name:
          emergency_contact_name ??
          teacher.emergency_contact_name,
        emergency_contact_number:
          emergency_contact_number ??
          teacher.emergency_contact_number,
      },
      {
        transaction,
      }
    );

    // Update linked User account
    if (teacher.user_id) {
      const user = await User.findByPk(teacher.user_id, {
        transaction,
      });

      if (user) {
        const userPayload = {
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone,
        };

        // Password ONLY changes when entered
        if (password && password.trim()) {
          if (password.length < 6) {
            await transaction.rollback();

            return res.status(400).json({
              message:
                "Password must be at least 6 characters.",
            });
          }

          userPayload.password = await bcrypt.hash(
            password,
            10
          );
        }

        await user.update(userPayload, {
          transaction,
        });
      }
    }

    await transaction.commit();

    res.json({
      message: "Teacher updated successfully.",
      teacher,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("updateTeacher error:", err);

    res.status(500).json({
      message: "Failed to update teacher.",
      error: err.message,
    });
  }
};

// POST /api/teachers/bulk
exports.bulkCreateTeachers = async (req, res) => {
  try {
    const { teachers } = req.body;

    if (!Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({
        message: "teachers[] is required.",
      });
    }

    const created = [];
    const errors = [];

    for (let i = 0; i < teachers.length; i++) {
      try {
        const row = { ...teachers[i] };

        if (!row.name) {
          errors.push({
            row: i + 1,
            error: "Missing name",
          });

          continue;
        }

        if (!row.email) {
          errors.push({
            row: i + 1,
            error: "Missing email",
          });

          continue;
        }

        if (!row.password || row.password.length < 6) {
          errors.push({
            row: i + 1,
            error:
              "Password must be at least 6 characters",
          });

          continue;
        }

        const normalizedEmail = row.email
          .trim()
          .toLowerCase();

        const existingUser = await User.findOne({
          where: {
            email: normalizedEmail,
          },
        });

        if (existingUser) {
          errors.push({
            row: i + 1,
            error: "Email already exists",
          });

          continue;
        }

        const hashedPassword = await bcrypt.hash(
          row.password,
          10
        );

        const user = await User.create({
          name: row.name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: "teacher",
          phone: row.phone || null,
          is_active: true,
        });

        const teacher = await Teacher.create({
          user_id: user.id,
          name: row.name.trim(),
          email: normalizedEmail,
          phone: row.phone || null,
          employee_id: row.employee_id || null,
          subject: row.subject || null,
          department: row.department || null,
          course: row.course || null,
          designation: row.designation || null,
          qualification: row.qualification || null,
          joining_date: row.joining_date || null,
          experience: row.experience || null,
          employment_type:
            row.employment_type || null,
          campus: row.campus || null,
          status: row.status || "active",
          address: row.address || null,
          emergency_contact_name:
            row.emergency_contact_name || null,
          emergency_contact_number:
            row.emergency_contact_number || null,
        });

        created.push(teacher);
      } catch (err) {
        errors.push({
          row: i + 1,
          error: err.message,
        });
      }
    }

    res.status(201).json({
      created: created.length,
      errors,
    });
  } catch (err) {
    console.error("bulkCreateTeachers error:", err);

    res.status(500).json({
      message: "Bulk import failed.",
      error: err.message,
    });
  }
};

// DELETE /api/teachers/:id
exports.deleteTeacher = async (req, res) => {
  const transaction = await Teacher.sequelize.transaction();

  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      transaction,
    });

    if (!teacher) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Teacher not found.",
      });
    }

    const userId = teacher.user_id;

    await teacher.destroy({
      transaction,
    });

    if (userId) {
      await User.destroy({
        where: {
          id: userId,
        },
        transaction,
      });
    }

    await transaction.commit();

    res.json({
      message: "Teacher and login account deleted.",
    });
  } catch (err) {
    await transaction.rollback();

    console.error("deleteTeacher error:", err);

    res.status(500).json({
      message: "Failed to delete teacher.",
      error: err.message,
    });
  }
};
