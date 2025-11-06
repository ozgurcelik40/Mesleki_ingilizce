/*
  # Add Sample Content for All Course Fields

  1. Purpose
    - Add modules, lessons, and vocabulary for all existing course fields
    - Provide comprehensive sample content for each professional field
    - Enable proper testing of the learning platform

  2. Content Added
    - Modules for: IT, Elektrik-Elektronik, Kimya, Mekanik, Mobilya, Biyomedikal, HVAC
    - Lessons for each module (video, reading, quiz, exercise types)
    - Vocabulary terms with definitions and examples
    - Proper ordering and duration for all content

  3. Notes
    - Each field gets 2-3 modules
    - Each module gets 3-4 lessons
    - Key lessons get vocabulary terms
*/

DO $$
DECLARE
  v_course_id uuid;
  v_module_id uuid;
  v_lesson_id uuid;
BEGIN
  -- IT Course Content (adding Module 3)
  SELECT id INTO v_course_id FROM courses WHERE field = 'IT' ORDER BY created_at LIMIT 1;
  IF v_course_id IS NOT NULL THEN
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES (v_course_id, 'Module 3: Software Development', 'Software development terminology and practices', 3)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '3.1 Programming Basics', 'Essential programming vocabulary and concepts', 'video', 1, 30),
      (v_module_id, '3.2 Software Testing', 'Understanding testing methodologies and terminology', 'reading', 2, 25),
      (v_module_id, '3.3 Development Quiz', 'Test your software development knowledge', 'quiz', 3, 15);
  END IF;

  -- Elektrik-Elektronik Course Content
  SELECT id INTO v_course_id FROM courses WHERE field = 'Elektrik-Elektronik' ORDER BY created_at LIMIT 1;
  IF v_course_id IS NOT NULL THEN
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES 
      (v_course_id, 'Module 1: Basic Circuits', 'Introduction to electrical circuits and components', 1)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '1.1 Circuit Components', 'Learn about resistors, capacitors, and inductors', 'video', 1, 25)
    RETURNING id INTO v_lesson_id;
    
    INSERT INTO vocabulary (lesson_id, term, definition, example_sentence)
    VALUES 
      (v_lesson_id, 'Resistor', 'A passive component that limits or regulates electrical current flow', 'The resistor reduces the current to protect the LED from burning out.'),
      (v_lesson_id, 'Voltage', 'The electrical potential difference between two points', 'The circuit operates at 12 volts DC voltage.'),
      (v_lesson_id, 'Current', 'The flow of electric charge through a conductor', 'The current flowing through the circuit is 2 amperes.');
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '1.2 Ohms Law', 'Understanding the relationship between voltage, current, and resistance', 'reading', 2, 20),
      (v_module_id, '1.3 Circuit Analysis', 'Practice analyzing simple circuits', 'exercise', 3, 30);
    
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES 
      (v_course_id, 'Module 2: Power Systems', 'Understanding electrical power systems', 2)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '2.1 Power Distribution', 'Learn about electrical power distribution systems', 'video', 1, 30),
      (v_module_id, '2.2 Safety Standards', 'Electrical safety terminology and standards', 'reading', 2, 25);
  END IF;

  -- Kimya Course Content
  SELECT id INTO v_course_id FROM courses WHERE field = 'Kimya' ORDER BY created_at LIMIT 1;
  IF v_course_id IS NOT NULL THEN
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES 
      (v_course_id, 'Module 1: Lab Equipment', 'Laboratory equipment and safety procedures', 1)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '1.1 Lab Safety', 'Essential laboratory safety procedures and equipment', 'video', 1, 20)
    RETURNING id INTO v_lesson_id;
    
    INSERT INTO vocabulary (lesson_id, term, definition, example_sentence)
    VALUES 
      (v_lesson_id, 'Beaker', 'A cylindrical container used to mix, heat, or store liquids', 'Pour the solution into a 500ml beaker for heating.'),
      (v_lesson_id, 'Pipette', 'A laboratory tool used to transport measured volumes of liquid', 'Use a pipette to add exactly 10ml of reagent to the mixture.'),
      (v_lesson_id, 'Fume Hood', 'A ventilated enclosure used to protect users from hazardous fumes', 'Always work with volatile chemicals inside the fume hood.');
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '1.2 Common Equipment', 'Overview of common laboratory equipment', 'reading', 2, 25),
      (v_module_id, '1.3 Safety Quiz', 'Test your laboratory safety knowledge', 'quiz', 3, 15);
    
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES 
      (v_course_id, 'Module 2: Chemical Reactions', 'Understanding chemical reactions and terminology', 2)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '2.1 Reaction Types', 'Learn about different types of chemical reactions', 'video', 1, 30),
      (v_module_id, '2.2 Chemical Equations', 'Understanding and writing chemical equations', 'reading', 2, 25);
  END IF;

  -- Mekanik Course Content
  SELECT id INTO v_course_id FROM courses WHERE field = 'Mekanik' ORDER BY created_at LIMIT 1;
  IF v_course_id IS NOT NULL THEN
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES 
      (v_course_id, 'Module 1: Machine Components', 'Introduction to mechanical components and systems', 1)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '1.1 Gears and Bearings', 'Understanding gears, bearings, and power transmission', 'video', 1, 25)
    RETURNING id INTO v_lesson_id;
    
    INSERT INTO vocabulary (lesson_id, term, definition, example_sentence)
    VALUES 
      (v_lesson_id, 'Gear Ratio', 'The ratio of the rotational speeds of two or more meshing gears', 'A gear ratio of 3:1 means the input shaft rotates three times for each output rotation.'),
      (v_lesson_id, 'Bearing', 'A machine element that reduces friction between moving parts', 'Replace the worn bearing to eliminate the noise from the rotating shaft.'),
      (v_lesson_id, 'Torque', 'A measure of the rotational force applied to an object', 'Tighten the bolt to a torque of 50 Newton-meters.');
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '1.2 Fasteners and Joints', 'Types of fasteners and mechanical joints', 'reading', 2, 20),
      (v_module_id, '1.3 Component Quiz', 'Test your knowledge of mechanical components', 'quiz', 3, 15);
    
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES 
      (v_course_id, 'Module 2: Manufacturing Processes', 'Common manufacturing and machining processes', 2)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '2.1 Machining Operations', 'Learn about turning, milling, and drilling operations', 'video', 1, 30),
      (v_module_id, '2.2 Welding Techniques', 'Common welding methods and terminology', 'reading', 2, 25);
  END IF;

  -- Mobilya Course Content
  SELECT id INTO v_course_id FROM courses WHERE field = 'Mobilya' ORDER BY created_at LIMIT 1;
  IF v_course_id IS NOT NULL THEN
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES 
      (v_course_id, 'Module 1: Wood Types and Materials', 'Understanding different wood types and materials', 1)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '1.1 Hardwoods and Softwoods', 'Distinguishing between hardwood and softwood species', 'video', 1, 20)
    RETURNING id INTO v_lesson_id;
    
    INSERT INTO vocabulary (lesson_id, term, definition, example_sentence)
    VALUES 
      (v_lesson_id, 'Hardwood', 'Wood from deciduous trees, typically denser and more durable', 'Oak is a popular hardwood choice for dining tables due to its strength.'),
      (v_lesson_id, 'Veneer', 'A thin layer of decorative wood applied to furniture surfaces', 'The cabinet features a beautiful walnut veneer over plywood construction.'),
      (v_lesson_id, 'Grain', 'The pattern and direction of wood fibers', 'Sand along the grain to achieve a smooth finish.');
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '1.2 Wood Properties', 'Physical and mechanical properties of wood', 'reading', 2, 25),
      (v_module_id, '1.3 Material Selection', 'Choosing appropriate materials for different applications', 'exercise', 3, 20);
    
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES 
      (v_course_id, 'Module 2: Furniture Construction', 'Furniture construction techniques and terminology', 2)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '2.1 Joinery Techniques', 'Common wood joinery methods and terminology', 'video', 1, 30),
      (v_module_id, '2.2 Finishing Methods', 'Surface finishing and treatment techniques', 'reading', 2, 25);
  END IF;

  -- Biyomedikal Course Content
  SELECT id INTO v_course_id FROM courses WHERE field = 'Biyomedikal' ORDER BY created_at LIMIT 1;
  IF v_course_id IS NOT NULL THEN
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES 
      (v_course_id, 'Module 1: Medical Equipment', 'Introduction to biomedical equipment and devices', 1)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '1.1 Diagnostic Devices', 'Common diagnostic medical devices and their functions', 'video', 1, 25)
    RETURNING id INTO v_lesson_id;
    
    INSERT INTO vocabulary (lesson_id, term, definition, example_sentence)
    VALUES 
      (v_lesson_id, 'Ultrasound', 'Medical imaging technique using high-frequency sound waves', 'The ultrasound device provides real-time images of internal organs.'),
      (v_lesson_id, 'ECG', 'Electrocardiogram - a test that measures electrical activity of the heart', 'The ECG machine shows the patient has a normal heart rhythm.'),
      (v_lesson_id, 'Sterilization', 'The process of eliminating all forms of microbial life', 'All surgical instruments must undergo sterilization before use.');
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '1.2 Device Safety', 'Medical device safety standards and protocols', 'reading', 2, 20),
      (v_module_id, '1.3 Equipment Quiz', 'Test your knowledge of medical equipment', 'quiz', 3, 15);
    
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES 
      (v_course_id, 'Module 2: Patient Monitoring', 'Patient monitoring systems and terminology', 2)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '2.1 Vital Signs Monitoring', 'Understanding vital signs and monitoring equipment', 'video', 1, 30),
      (v_module_id, '2.2 Patient Data Systems', 'Electronic health records and data management', 'reading', 2, 25);
  END IF;

  -- HVAC Course Content
  SELECT id INTO v_course_id FROM courses WHERE field = 'HVAC' ORDER BY created_at LIMIT 1;
  IF v_course_id IS NOT NULL THEN
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES 
      (v_course_id, 'Module 1: Climate Control Basics', 'Introduction to heating, ventilation, and air conditioning', 1)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '1.1 Temperature and Humidity', 'Understanding temperature control and humidity regulation', 'video', 1, 25)
    RETURNING id INTO v_lesson_id;
    
    INSERT INTO vocabulary (lesson_id, term, definition, example_sentence)
    VALUES 
      (v_lesson_id, 'Thermostat', 'A device that automatically regulates temperature', 'Set the thermostat to 22 degrees Celsius for optimal comfort.'),
      (v_lesson_id, 'BTU', 'British Thermal Unit - a measure of cooling or heating capacity', 'This air conditioner has a cooling capacity of 12,000 BTU.'),
      (v_lesson_id, 'Refrigerant', 'A substance used in cooling systems to absorb and release heat', 'The system uses R-410A refrigerant, which is environmentally friendly.');
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '1.2 Ventilation Principles', 'Air circulation and ventilation fundamentals', 'reading', 2, 20),
      (v_module_id, '1.3 Climate Control Quiz', 'Test your understanding of climate control basics', 'quiz', 3, 15);
    
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES 
      (v_course_id, 'Module 2: HVAC Systems', 'Types of HVAC systems and components', 2)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module_id, '2.1 Split Systems', 'Understanding split air conditioning systems', 'video', 1, 30),
      (v_module_id, '2.2 Ductwork Design', 'Basics of duct design and installation', 'reading', 2, 25);
  END IF;
END $$;