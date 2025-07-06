#!/usr/bin/env python3
"""
Script to generate SQL insert statements for lessons from a JSON file.
This allows for easier management of lesson content in a structured format.
"""

import json
import os
import uuid
import argparse
from datetime import datetime


def generate_uuid():
    """Generate a UUID v4 string."""
    return str(uuid.uuid4())


def escape_sql_string(s):
    """Escape single quotes in SQL strings."""
    if s is None:
        return None
    return s.replace("'", "''")


def generate_sql_from_json(json_file, output_file):
    """
    Generate SQL insert statements from a JSON file containing lesson data.
    
    Args:
        json_file (str): Path to the JSON file containing lesson data
        output_file (str): Path to output SQL file
    """
    # Load JSON data
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    # Start building SQL file content
    sql_content = [
        "-- Auto-generated SQL for inserting lessons",
        "-- Generated on: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "-- Source: " + os.path.basename(json_file),
        "",
        "USE sadp;",
        "",
        "-- Begin transaction",
        "START TRANSACTION;",
        ""
    ]
    
    # First, get module IDs by slug to ensure foreign key constraints are met
    sql_content.append("-- Get module IDs by slug to ensure foreign key constraints are met")
    
    # Process module variables if provided
    if "module_slugs" in data:
        for module_name, module_slug in data["module_slugs"].items():
            sql_content.append(f"SET @{module_name} = (SELECT id FROM modules WHERE slug = '{module_slug}');")
            # Add a check to ensure the module exists
            sql_content.append(f"SELECT IF(@{module_name} IS NULL, CONCAT('Error: Module with slug \"{module_slug}\" not found'), 'Module found') AS module_check;")
        sql_content.append("")
    
    # Process lessons
    if "lessons" in data:
        sql_content.append("-- Insert lessons")
        sql_content.append("INSERT INTO lessons (id, module_id, title, slug, description, content_type, content, order_index, is_active, created_at, updated_at)")
        sql_content.append("VALUES")
        
        lesson_values = []
        for lesson in data["lessons"]:
            # Generate UUID if not provided
            lesson_id = lesson.get("id", generate_uuid())
            
            # Get module_id - either direct value, variable reference, or slug reference
            module_id = lesson["module_id"]
            if module_id.startswith("@"):
                module_id_sql = module_id
            elif "module_slug" in lesson:
                # If module_slug is provided, use it to look up the module ID
                module_slug = escape_sql_string(lesson["module_slug"])
                module_id_sql = f"(SELECT id FROM modules WHERE slug = '{module_slug}')"
            else:
                module_id_sql = f"'{module_id}'"
            
            # Escape strings for SQL
            title = escape_sql_string(lesson["title"])
            slug = escape_sql_string(lesson["slug"])
            description = escape_sql_string(lesson["description"])
            content = escape_sql_string(lesson["content"])
            content_type = lesson.get("content_type", "theory")
            
            # Validate content_type against the enum
            valid_content_types = ["theory", "demonstration", "exercise", "quiz"]
            if content_type not in valid_content_types:
                print(f"Warning: Invalid content_type '{content_type}' for lesson '{title}'. Using 'theory' instead.")
                content_type = "theory"
            
            # Format the SQL value tuple
            value = (
                f"('{lesson_id}', {module_id_sql}, '{title}', '{slug}', "
                f"'{description}', '{content_type}', '{content}', "
                f"{lesson['order_index']}, {1 if lesson.get('is_active', True) else 0}, "
                f"CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            )
            lesson_values.append(value)
        
        # Join all values with commas and add a semicolon at the end
        sql_content.append(",\n".join(lesson_values) + ";")
        sql_content.append("")
    
    # Add commit and verification queries
    sql_content.extend([
        "-- Commit transaction",
        "COMMIT;",
        "",
        "-- Verification queries",
        "SELECT COUNT(*) AS total_lessons FROM lessons;",
        "",
        "-- Display all lessons for verification",
        "SELECT m.name AS module_name, l.title AS lesson_title, l.slug, l.order_index",
        "FROM modules m",
        "JOIN lessons l ON m.id = l.module_id",
        "ORDER BY m.order_index, l.order_index;",
        ""
    ])
    
    # Write SQL to output file
    with open(output_file, 'w') as f:
        f.write("\n".join(sql_content))
    
    print(f"SQL file generated successfully: {output_file}")
    print(f"Total lessons processed: {len(data.get('lessons', []))}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate SQL insert statements for lessons from a JSON file")
    parser.add_argument("json_file", help="Path to the JSON file containing lesson data")
    parser.add_argument("--output", "-o", default="generated_lessons.sql", 
                        help="Path to output SQL file (default: generated_lessons.sql)")
    
    args = parser.parse_args()
    generate_sql_from_json(args.json_file, args.output)
