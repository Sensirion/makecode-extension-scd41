namespace SCD41 {

    export enum SCD41_T_UNIT {
        //% block="C"
        C = 0,
        //% block="F"
        F = 1
    }

    const SCD41_I2C_ADDR = 0x62;

    let co2 = 0;
    let temperature = 0;
    let relative_humidity = 0;
    let serial_number = 0;
    let feature_set = 0;

    init();

    function read_word(repeat=false) {
        let value = pins.i2cReadNumber(SCD41_I2C_ADDR, NumberFormat.UInt16BE, repeat);
        pins.i2cReadNumber(SCD41_I2C_ADDR, NumberFormat.UInt8BE, true);  // CRC ignored for now
        return value
    }

    function read_feature_set() {
        pins.i2cWriteNumber(SCD41_I2C_ADDR, 0x202f, NumberFormat.UInt16BE);
        feature_set = read_word();
    }

    function read_serial_number() {
        pins.i2cWriteNumber(SCD41_I2C_ADDR, 0x21b1, NumberFormat.UInt16BE);
        serial_number = read_word(false) << 32 | read_word(false) << 16 | read_word();
    }

    function read_measurement() {
        pins.i2cWriteNumber(SCD41_I2C_ADDR, 0xEC05, NumberFormat.UInt16BE);
        co2 = read_word(true);
        let adc_t = read_word(true);
        let adc_rh = read_word();
        temperature = -45 + (175 * Math.idiv(adc_t, 1 << 16));
        relative_humidity = 100 * Math.idiv(adc_rh, 1 << 16);
    }

    /**
     * init
     */
    //% blockId="SCD41_INIT" block="init"
    //% weight=80 blockGap=8
    export function init() {
        read_feature_set();
        read_serial_number();
        start_continuous_measurement();
    }

    /**
     * start continuous measurement. Call this before reading measurements
     */
    //% blockId="SCD41_START_CONTINUOUS_MEASUREMENT" block="start continuous measurement"
    //% weight=80 blockGap=8
    export function start_continuous_measurement() {
        pins.i2cWriteNumber(SCD41_I2C_ADDR, 0x21b1, NumberFormat.UInt16BE);
    }

    /**
     * stop continuous measurement. Call this to stop SCD41 internal measurements
     */
    //% blockId="SCD41_STOP_CONTINUOUS_MEASUREMENT" block="stop continuous measurement"
    //% weight=80 blockGap=8
    export function stop_continuous_measurement() {
        pins.i2cWriteNumber(SCD41_I2C_ADDR, 0x3F86, NumberFormat.UInt16BE);
    }

    /**
     * get feature set version
     */
    //% blockId="SCD41_GET_FEATURE_SET" block="feature set %u"
    //% weight=80 blockGap=8
    export function get_feature_set() {
        if (feature_set == 0) {
            read_feature_set();
        }
        return feature_set;
    }

    /**
     * get serial number
     */
    //% blockId="SCD41_GET_SERIAL_NUMBER" block="serial number %d"
    //% weight=80 blockGap=8
    export function get_serial_number() {
        if (serial_number == 0) {
            read_serial_number();
        }
        return serial_number;
    }

    /**
     * get CO2
     */
    //% blockId="SCD41_GET_CO2" block="co2 %u"
    //% weight=80 blockGap=8
    export function get_co2() {
        read_measurement();
        return co2;
    }

    /**
     * get temperature
     */
    //% blockId="SCD41_GET_TEMPERATURE" block="temperature %u"
    //% weight=80 blockGap=8
    export function get_temperature(unit: SCD41_T_UNIT = SCD41_T_UNIT.C) {
        read_measurement();
        if (unit == SCD41_T_UNIT.C) {
            return temperature
        }
        return 32 + Math.idiv(temperature * 9 , 5);
    }

    /**
     * get relative humidity
     */
    //% blockId="SCD41_GET_RELATIVE_HUMIDITY" block="relative humidity %u"
    //% weight=80 blockGap=8
    export function get_relative_humidity() {
        read_measurement();
        return relative_humidity;
    }

    /**
     * perform a factory reset
     */
    //% blockId="SCD41_PERFORM_FACTORY_RESET" block="factory reset"
    //% weight=80 blockGap=8
    export function perform_factory_reset() {
        pins.i2cWriteNumber(SCD41_I2C_ADDR, 0x3632, NumberFormat.UInt16BE);
    }
}
