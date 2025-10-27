# 👓 Optical Validators Package
A robust TypeScript/JavaScript package for validating, formatting, and converting optical prescriptions (Eyeglasses and Contact Lenses).

## 🚀 Installation
```bash
npm install optical-prescription-utils
# or
yarn add optical-prescription-utils
```

## 📝 TypeScript Support
This package is written in TypeScript and includes type definitions out-of-the-box, offering full type safety for inputs and outputs.

## 🔬 EyeTestValidator
This class handles the validation and formatting of standard eyeglass prescription parameters (SPH, CYL, AXIS, ADD, PD, etc.). It ensures all values conform to required optical standards (e.g., multiples of 0.25, specific ranges, and consistent sign notation).

### Key Features
- Validation: Checks ranges and $0.25$ multiples.
- Formatting: Ensures standard optical notation (e.g., +05.50, -01.25).
- Transposition: Converts SPH/CYL/AXIS to the negative cylinder format.

### Usage Example

- Usage Example: Validation and Formatting SPH/CYL/AXIS
```typescript
        import { EyeTestValidator } from 'optical-prescription-utils'; // (assuming this is the correct path)

        const validator = new EyeTestValidator();
        const sphere = -1.50;
        const cyl = -0.75;
        const axis = 180;

        const vs = validator.validateSPH(sphere);
        const vc = validator.validateCYL(cyl);
        const va = validator.validateAxis(axis);

        if (vs === null || vc === null || va === null) {
        console.error("Invalid prescription value!");
        } else {
        console.log(
            `${vs} ${vc} × ${va}`
        );
        // Output → "-01.50 -00.75 × 180" 
        }
```

- Usage Example: Validation and Formatting
```typescript
import { EyeTestValidator } from 'optical-prescription-utils';

const validator = new EyeTestValidator();

const prescriptionData = {
  sphere: "-4.50",
  cylinder: "+1.25",
  axis: "90",
  add: "2.50",
  pd: 65,
  vertexDistance: 12.5
};

const result = validator.validatePrescription(prescriptionData);

if (result.valid) {
  console.log("Prescription is valid and formatted:", result.formatted);
  /* Output:
  {
    sphere: '-04.50',
    cylinder: '+01.25',
    axis: 90,
    add: '+02.50',
    pd: 65,
    vertexDistance: 12.5
  }
  */
} else {
  console.error("Validation Errors:", result.errors);
}
```

- Usage Example: Transposition (Conversion)
Converts a positive cylinder prescription to the standard negative cylinder format.
```typescript
const originalSPH = -2.00;
const originalCYL = +1.00;
const originalAXIS = 90;

const transposed = validator.transformSphCylAxis(
  originalSPH, 
  originalCYL, 
  originalAXIS
);

console.log("Transposed Prescription:", transposed);
/* Output (equivalent to -1.00 -1.00 x 180):
{ 
  sph: '-01.00', 
  cyl: '-01.00', // CYL is always negative
  axis: 180       // AXIS is adjusted by 90 degrees
}
*/
```
## ContactLensValidator
This class handles the conversion of an eyeglass prescription into a Contact Lens prescription, accounting for the Vertex Distance (BV) effect.

### Key Conversion Logic
- Vertex Distance Compensation: Applies the formula $D_c = D_g / (1 - d \cdot D_g)$ where $D_c$ is contact lens power, $D_g$ is glasses power, and $d$ is vertex distance in meters. This compensation is applied if the SPH power exceeds $4$ Diopters.
- Rounding: All final values are rounded to the nearest $0.25$ (quarter Diopter) suitable for contact lens availability.
- Toric Calculation: Toric conversion calculates the new cylinder power after vertex compensation on the principal meridians

### Usage Example: Spherical Conversion
Converts an eyeglass prescription to a spherical contact lens prescription (using the Spherical Equivalent if CYL is present).

```typescript
import { ContactLensValidator } from 'optical-prescription-utils';

const clValidator = new ContactLensValidator();

const glassesData = { 
  SPH: -5.25, 
  CY: -1.00, 
  AX: 90, 
  BV: 12, // Vertex Distance in mm
  ADD: 2.00 
};

const sphericalResult = clValidator.convertToSpheric(glassesData);

console.log("Spherical Contact Lens Result:", sphericalResult);
/* Output (Example):
{
  SPH: '-06.00', // SPH adjusted for BV and rounded
  ADD: '+02.00', 
  'Exact SPH': '-05.87',
  AX: '',
  BV: 12
}
*/
```

### Usage Example: Toric Conversion
Converts an eyeglass prescription to a toric contact lens prescription (maintaining cylinder), with both SPH and CYL vertex-compensated.

```typescript
const toricResult = clValidator.convertToToric(glassesData);

console.log("Toric Contact Lens Result:", toricResult);
/* Output (Example):
{
  SPH: '-05.25', // SPH adjusted for BV and rounded
  CY: '-01.00', // CYL adjusted for BV and rounded
  ADD: '+02.00',
  AX: '90',
  'Exact SPH': '-05.15', 
  'Exact CY': '-01.03',
  BV: 12
}
*/
```
## 💡 Contributing

We welcome contributions! If you have suggestions for improving validation rules, finding bugs, or adding new features, please open an issue or submit a Pull Request.

**GitHub Repository:** [https://github.com/Elhussin/optical-prescription-utils.git](https://github.com/Elhussin/optical-prescription-utils.git)

## 💬 Support & Contact

If you have any questions, need technical support, or want to discuss features, feel free to reach out:

* **Email:** [hasin3112@gmail.com](mailto:hasin3112@gmail.com)
* **GitHub Issues:** [Open an Issue here](https://github.com/Elhussin/optical-prescription-utils/issues) (The preferred way to report bugs)

## 📜 License
This project is licensed under the **MIT License**.

