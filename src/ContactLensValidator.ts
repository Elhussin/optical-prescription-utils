/**
 * A utility class for converting eyeglass prescriptions to contact lens prescriptions.
 * Supports both spherical and toric (astigmatic) contact lens conversions with vertex
 * distance compensation for high power prescriptions.
 * 
 * @example
 * // Basic usage
 * const validator = new ContactLensValidator();
 * 
 * // Convert to spherical contact lens
 * const sphericalResult = validator.convertToSpheric({ 
 *   SPH: "-5.25", 
 *   CY: "-1.00", 
 *   AX: "90", 
 *   BV: "12", 
 *   ADD: "2.00" 
 * });
 * 
 * // Convert to toric contact lens
 * const toricResult = validator.convertToToric({ 
 *   SPH: "-5.25", 
 *   CY: "-1.00", 
 *   AX: "90", 
 *   BV: "12", 
 *   ADD: "2.00" 
 * });
 */

export class ContactLensValidator {
  /**
   * Converts an eyeglass prescription to a spherical contact lens prescription.
   * Applies vertex distance compensation for high powers (>4.00D) and rounds to nearest quarter diopter.
   * 
   * @param data - The prescription data object containing:
   *   - SPH: Sphere power (string or number, e.g., "-5.25")
   *   - CY: Cylinder power (string or number, optional, defaults to "0")
   *   - AX: Axis (string or number, optional, defaults to "0")
   *   - BV: Vertex distance in mm (string or number, optional, defaults to "12")
   *   - ADD: Addition power (string or number, optional, defaults to "0")
   * @returns An object containing the converted prescription with these properties:
   *   - SPH: Rounded spherical power
   *   - ADD: Addition power
   *   - AX: Empty string (not applicable for spherical)
   *   - BV: Vertex distance used
   *   - Exact SPH: The calculated power before rounding
   */

  convertToSpheric(data: Record<string, string | number>): Record<string, string | number> {
    const sphere = String(data["SPH"] ?? "0").trim();
    const cylinder = String(data["CY"] ?? "0").trim();
    const axis = String(data["AX"] ?? "0").trim();
    const vertexDistance = String(data["BV"] ?? "12").trim();
    const add = String(data["ADD"] ?? "0").trim();

    const sph = sphere ? parseFloat(sphere) : 0;
    const cyl = cylinder ? parseFloat(cylinder) : 0;
    const ax = axis ? parseFloat(axis) : 0;
    const bv = vertexDistance ? parseFloat(vertexDistance) : 12;
    const addValue = add ? parseFloat(add) : 0;


    const totalSphere = Math.abs(cyl) !== 0 ? this.sphericalEquivalent(sph, cyl) : sph;

    const sphereContactLens =
      Math.abs(totalSphere) > 4
        ? this.sphericWithoutVertexDistance(totalSphere, bv)
        : totalSphere;

    const nearestValue = this.roundToNearestQuarter(sphereContactLens);

    let value: Record<string, string | number> = {
      SPH: nearestValue,
      ADD: addValue,
    };

    value = this.formatResultToQuarter(value);
    value["Exact SPH"] = this.formatPower(sphereContactLens);
    value["AX"] = "";
    value["BV"] = bv;

    return value;
  }

 /**
   * Converts an eyeglass prescription to a toric contact lens prescription.
   * Handles vertex distance compensation for both sphere and cylinder powers.
   * 
   * @param data - The prescription data object containing:
   *   - SPH: Sphere power (string or number, e.g., "-5.25")
   *   - CY: Cylinder power (string or number, optional, defaults to "0")
   *   - AX: Axis (string or number, optional, defaults to "0")
   *   - BV: Vertex distance in mm (string or number, optional, defaults to "12")
   *   - ADD: Addition power (string or number, optional, defaults to "0")
   * @returns An object containing the converted prescription with these properties:
   *   - SPH: Rounded spherical power
   *   - CY: Rounded cylinder power
   *   - AX: Original axis
   *   - ADD: Addition power
   *   - BV: Vertex distance used
   *   - Exact SPH: The calculated sphere power before rounding
   *   - Exact CY: The calculated cylinder power before rounding
   */
  convertToToric(data: Record<string, string | number>): Record<string, string | number> {
    const sphere = String(data["SPH"] ?? "0").trim();
    const cylinder = String(data["CY"] ?? "0").trim();
    const axis = String(data["AX"] ?? "0").trim();
    const vertexDistance = String(data["BV"] ?? "12").trim();
    const add = String(data["ADD"] ?? "0").trim();

    const sph = sphere ? parseFloat(sphere) : 0;
    const cyl = cylinder ? parseFloat(cylinder) : 0;
    const ax = axis ? parseFloat(axis) : 0;
    const bv = vertexDistance ? parseFloat(vertexDistance) : 12;
    const addValue = add ? parseFloat(add) : 0;

    const spherPower = this.sphericWithoutVertexDistance(sph, bv);
    const cylinderPower =
      this.sphericWithoutVertexDistance(sph + cyl, bv) - spherPower;

    const nearestCylinder = this.roundToNearestQuarter(cylinderPower);
    const nearestSphere = this.roundToNearestQuarter(spherPower);

    let value: Record<string, string | number> = {
      SPH: nearestSphere,
      CY: nearestCylinder,
      ADD: addValue,
    };

    value = this.formatResultToQuarter(value);
    value["AX"] = `${ax.toFixed(0)}`;
    // value["Exact SPH"] = `${spherPower >= 0 ? "+" : ""}${spherPower.toFixed(2)}`;
    // value["Exact CY"] = `${cylinderPower >= 0 ? "+" : ""}${cylinderPower.toFixed(2)}`;
    value["Exact SPH"] = this.formatPower(spherPower);
    value["Exact CY"] = this.formatPower(cylinderPower);
    value["BV"] = bv;

    return value;
  }

  formatResultToQuarter(value: Record<string, string | number>): Record<string, string | number> {

    for (const key in value) {
      value[key] = this.formatNumberCustom(value[key]);
    }
    return value;
  }

  sphericWithoutVertexDistance(sphere: number, vertexDistance: number): number {
    return sphere / (1 - (vertexDistance / 1000) * sphere);
  }

  sphericalEquivalent(sphere: number, cylinder: number): number {
    return parseFloat((sphere + cylinder / 2).toFixed(2));
  }

  roundToNearestQuarter(num: number): number {
    return Math.round(num * 4) / 4;
  }

  formatNumberCustom(value: string | number): any {
    const num = typeof value === "number" ? value : parseFloat(String(value));
    if (this.isMultipleOfQuarter(num)) {
      return this.formatPower(num);
    }
        return "";
  }


  isMultipleOfQuarter(value: number): boolean {
    return value % 0.25 === 0;
  }


  formatPower(value: number): string {
    const fixed = Math.abs(value).toFixed(2);

    // تصحيح: معالجة الصفر بشكل صحيح
    let sign = "";
    if (value > 0) {
      sign = "+";
    } else if (value < 0) {
      sign = "-";
    } else {
      sign = "+"; // الصفر يُعامل كموجب
    }

    if (Math.abs(value) < 10) {
      return `${sign}0${fixed}`;
    }
    return `${sign}${fixed}`;
  }

}

