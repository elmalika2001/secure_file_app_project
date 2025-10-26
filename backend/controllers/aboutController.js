// Get about information
exports.getAbout = async (req, res) => {
  try {
    const aboutInfo = {
      student: {
        name: "Student Name",
        university: "Central Lancashire University",
        program: "Cybersecurity",
        project: "SecureShare - Secure File-Sharing System"
      },
      project: {
        title: "SecureShare",
        description: "A secure file-sharing application demonstrating practical implementation of cryptographic principles and secure coding practices.",
        objectives: [
          "Implement end-to-end encryption using AES-256",
          "Develop secure RSA key exchange mechanisms",
          "Integrate multi-factor authentication (MFA)",
          "Create role-based access control (RBAC)",
          "Ensure file integrity with SHA-256 hashing",
          "Build a user-friendly web interface"
        ],
        technologies: [
          "Node.js", "Express.js", "MongoDB",
          "AES-256", "RSA", "JWT",
          "HTML5", "CSS3", "JavaScript"
        ]
      }
    };

    res.json(aboutInfo);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
