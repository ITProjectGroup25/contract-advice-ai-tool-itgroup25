  {!itemIsAlwaysVisible && (
                      <div className="m-t-20 p-l-0">
                        <FormControl
                          style={{ minWidth: "100%", marginBottom: 15 }}
                        >
                          <InputLabel>Visible when control</InputLabel>
                          <Select
                            value={visibilityCondition.controlId || ""}
                            onChange={handleControlSelectionChange}
                            label="Visible when control"
                          >
                            <MenuItem value="">
                              <em>Select a control</em>
                            </MenuItem>
                            {availableControls.map((control) => (
                              <MenuItem key={control.id} value={control.id}>
                                {control.labelName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Show value selection dropdown when a control is selected */}
                        {visibilityCondition.controlId &&
                          selectedControlOptions.length > 0 && (
                            <FormControl style={{ minWidth: "100%" }}>
                              <InputLabel>Has value</InputLabel>
                              <Select
                                value={visibilityCondition.selectedValue || ""}
                                onChange={handleValueSelectionChange}
                                label="Has value"
                              >
                                <MenuItem value="">
                                  <em>Select a value</em>
                                </MenuItem>
                                {selectedControlOptions.map((option) => (
                                  <MenuItem
                                    key={option.id}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                      </div>
                    )}
                  </div>
