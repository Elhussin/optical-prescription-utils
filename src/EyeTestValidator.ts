
/**
 * A utility class for validating and formatting eye test prescription data.
 * Provides methods to validate various ophthalmic measurements such as sphere (SPH),
 * cylinder (CYL), axis, pupillary distance (PD), and more according to standard
 * optometric practices.
 */

export class EyeTestValidator {
  /**
   * Checks if a number is a multiple of 0.25 (quarter diopter)
   * @param value - The number to check
   * @returns boolean - True if the value is a multiple of 0.25, false otherwise
   */
  isMultipleOfQuarter(value: number): boolean {
    return Math.round(value * 100) % 25 === 0;
  }

  /**
   * Formats a number to a two decimal place string with a sign prefix
   * @param value - The number to format
   * @returns string - The formatted number with sign prefix
   */
  formatPower(value: number): string {
    const absValue = Math.abs(value);
    const fixed = absValue.toFixed(2);
    let formattedValue: string;
    let sign = "";
    if (value >= 0) {
      sign = "+";
    } else {
      sign = "-";
    }

    if (absValue < 10) {
      formattedValue = `0${fixed}`;
    } else {
      formattedValue = fixed;
    }
    return `${sign}${formattedValue}`;
  }

  /**
  * Validates sphere (SPH) value
  * @param value - The sphere value to validate
  * @returns string | null - Formatted SPH if valid, null otherwise
  */
  validateSPH(value: number): string | null {
    if (!this.isMultipleOfQuarter(value)) return null;
    if (value < -60 || value > 60) return null;
    return this.formatPower(value);
  }

  /**
   * Validates cylinder (CYL) value
   * @param value - The cylinder value to validate
   * @returns string | null - Formatted CYL if valid, null otherwise
   */
  validateCYL(value: number): string | null {
    if (!this.isMultipleOfQuarter(value)) return null;
    if (value < -15 || value > 15) return null;
    return this.formatPower(value);
  }

  /**
 * Validates axis value
 * @param value - The axis value to validate (0-180 degrees)
 * @returns number | null - Rounded axis if valid, null otherwise
 */
  validateAxis(value: number): number | null {
    if (value < 0 || value > 180) return null;
    return Math.round(value);
  }

  /**
 * Validates pupillary distance (PD) value
 * @param value - The PD value to validate
 * @returns number | null - The PD value if valid (19-85mm), null otherwise
 */
  validatePD(value: number): number | null {
    const num = Number(value);
    return !isNaN(num) && num >= 19 && num <= 85 ? num : null;
  }

  /**
   * Validates addition (ADD) power value
   * @param value - The ADD power to validate
   * @returns string | null - Formatted ADD if valid, null otherwise
   */
  validateADD(value: number): string | null {
    if (!this.isMultipleOfQuarter(value)) return null;
    if (value < 0.25 || value > 6) return null;
    return this.formatPower(value);
  }

  /**
   * Validates Sgmeant Height (SG) value
   * @param value - The SG value to validate
   * @returns number | null - The SG value if valid (7-50), null otherwise
   */
  validateSG(value: string | number): number | null {
    const num = Number(value);
    return !isNaN(num) && num >= 7 && num <= 50 ? num : null;
  }

  /**
   * Validates vertex distance value
   * @param value - The vertex distance to validate
   * @returns number | null - The vertex distance if valid (10-15mm), null otherwise
   */
  validateVertexDistance(value: string | number): number | null {
    const num = Number(value);
    return !isNaN(num) && num >= 10 && num <= 15 ? num : null;
  }

    /**
   * Transforms SPH/CYL/AXIS values for cross-cylinder calculations
   * @param sph - Sphere value
   * @param cyl - Cylinder value
   * @param axis - Axis value
   * @returns {sph: string, cyl: string, axis: number} | null - Transformed values or null if invalid
   */
  transformSphCylAxis(sph: number, cyl: number, axis: number) {
    const sphNum = Number(sph);
    const cylNum = Number(cyl);
    const axisNum = Number(axis);


    if (!cylNum || cylNum <= 0) return null;
    const newCyl = -Math.abs(cylNum);

    const newSph = sphNum + cylNum;

    // تعديل AXIS
    let newAxis = axisNum > 90 ? axisNum - 90 : axisNum + 90;
    newAxis = this.validateAxis(newAxis) ?? newAxis;

    return {
      sph: this.formatPower(newSph),
      cyl: this.formatPower(newCyl),
      axis: newAxis,
    };
  }

  /**
   * Checks if SPH/CYL/AXIS values are valid for cross-cylinder calculations
   * @param sph - Sphere value
   * @param cyl - Cylinder value
   * @param axis - Axis value
   * @returns boolean - True if valid, false otherwise
   */
  checkSphCylAxisCombo(
    sph: number | string | null | undefined,
    cyl: number | string | null | undefined,
    axis: number | string | null | undefined
  ): boolean {
    const sphValue = sph !== null && sph !== undefined && sph !== "" ? Number(sph) : null;
    const cylValue = cyl !== null && cyl !== undefined && cyl !== "" ? Number(cyl) : null;
    const axisValue = axis !== null && axis !== undefined && axis !== "" ? Number(axis) : null;

    const hasSph = sphValue !== null;
    const hasCyl = cylValue !== null && cylValue !== 0;
    const hasAxis = axisValue !== null;

    // الحالات الصحيحة:
    // 1. SPH فقط (بدون CYL و AXIS)
    if (hasSph && !hasCyl && !hasAxis) return true;

    // 2. SPH + CYL + AXIS
    if (hasSph && hasCyl && hasAxis) return true;

    // 3. CYL + AXIS فقط (بدون SPH أو SPH = 0)
    if (hasCyl && hasAxis) return true;

    // 4. لا شيء (كلها فارغة)
    if (!hasSph && !hasCyl && !hasAxis) return false;

    return false;
  }
  
  /**
   * Validates a complete prescription object
   * @param data - Object containing prescription data
   * @param data.sphere - Sphere value
   * @param data.cylinder - Cylinder value
   * @param data.axis - Axis value
   * @param data.add - Addition power value
   * @param data.pd - Pupillary distance
   * @param data.sg - Specific gravity
   * @param data.vertexDistance - Vertex distance
   * @returns {valid: boolean, errors: string[], formatted: any} - Validation result
   */
  validatePrescription(data: {
    sphere?: number | string | null;
    cylinder?: number | string | null;
    axis?: number | string | null;
    add?: number | string | null;
    pd?: number | string | null;
    sg?: number | string | null;
    vertexDistance?: number | string | null;
  }): { valid: boolean; errors: string[]; formatted: any } {
    const errors: string[] = [];
    const formatted: any = {};

    // التحقق من مجموعة SPH/CYL/AXIS
    if (!this.checkSphCylAxisCombo(data.sphere, data.cylinder, data.axis)) {
      errors.push("CYL and AXIS must be entered together, or both left empty.");
      return { valid: false, errors, formatted };
    }

    // SPH
    if (data.sphere !== null && data.sphere !== undefined && data.sphere !== "") {
      const sph = this.validateSPH(Number(data.sphere));
      if (!sph) errors.push("SPH must be multiple of 0.25 and between -60.00 and +60.00.");
      else formatted.sphere = sph;
    }

    // CYL
    if (data.cylinder !== null && data.cylinder !== undefined && data.cylinder !== "") {
      const cyl = this.validateCYL(Number(data.cylinder));
      if (!cyl) errors.push("CYL must be multiple of 0.25 and between -15.00 and +15.00.");
      else formatted.cylinder = cyl;
    }

    // AXIS
    if (data.axis !== null && data.axis !== undefined && data.axis !== "") {
      const axis = this.validateAxis(Number(data.axis));
      if (axis === null) errors.push("AXIS must be an integer between 0 and 180.");
      else formatted.axis = axis;
    }

    // ADD
    if (data.add !== null && data.add !== undefined && data.add !== "") {
      const add = this.validateADD(Number(data.add));
      if (!add) errors.push("ADD must be multiple of 0.25 and between +0.25 and +6.00.");
      else formatted.add = add;
    }

    // PD
    if (data.pd !== null && data.pd !== undefined && data.pd !== "") {
      const pd = this.validatePD(Number(data.pd));
      if (pd === null) errors.push("PD must be an integer between 19 and 85.");
      else formatted.pd = pd;
    }

    // SG
    if (data.sg !== null && data.sg !== undefined && data.sg !== "") {
      const sg = this.validateSG(data.sg);
      if (sg === null) errors.push("SG must be between 7 and 50.");
      else formatted.sg = sg;
    }

    // Vertex Distance - تصحيح رسالة الخطأ
    if (data.vertexDistance !== null && data.vertexDistance !== undefined && data.vertexDistance !== "") {
      const vd = this.validateVertexDistance(data.vertexDistance);
      if (vd === null) errors.push("Vertex Distance must be between 10 and 15.");
      else formatted.vertexDistance = vd;
    }

    return { valid: errors.length === 0, errors, formatted };
  }
}