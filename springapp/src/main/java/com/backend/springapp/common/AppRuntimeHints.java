package com.backend.springapp.common;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AssignableTypeFilter;

/**
 * Registers every Java record in com.backend.springapp for GraalVM native-image reflection.
 *
 * Jackson's RecordUtil calls Class.getRecordComponents() at serialization time, which
 * requires all record accessor methods to be in the reflection config. Rather than
 * maintaining a manual list, this registrar scans the whole base package at AOT build
 * time so any new record is covered without extra configuration.
 */
public class AppRuntimeHints implements RuntimeHintsRegistrar {

    private static final String BASE_PACKAGE = "com.backend.springapp";

    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        ClassPathScanningCandidateComponentProvider scanner =
                new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AssignableTypeFilter(Record.class));

        scanner.findCandidateComponents(BASE_PACKAGE).forEach(bd -> {
            try {
                Class<?> cls = Class.forName(bd.getBeanClassName(), false, classLoader);
                if (cls.isRecord()) {
                    hints.reflection().registerType(cls,
                            MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                            MemberCategory.INVOKE_PUBLIC_METHODS,
                            MemberCategory.DECLARED_FIELDS);
                }
            } catch (ClassNotFoundException ignored) {
            }
        });
    }
}
