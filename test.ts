// tests go here; this will not be compiled when this package is used as an extension.
basic.forever(function () {
    serial.writeValue("CO2", SCD41.get_co2());
    serial.writeValue("T", SCD41.get_temperature(SCD41.SCD41_T_UNIT.C));
    serial.writeValue("RH", SCD41.get_relative_humidity());
    basic.pause(5000);
})